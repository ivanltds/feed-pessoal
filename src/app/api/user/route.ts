import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const ALL_TOPICS = ['Tecnologia', 'Economia', 'Geopolítica', 'Ciência', 'Brasil', 'Mundo', 'Cultura', 'Esportes']
const DEFAULT_WEIGHT = 5.0
const UNSELECTED_WEIGHT = 1.0

export async function GET() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { topicWeights: true },
  })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const selectedTopics = user.topicWeights
    .filter((w) => w.weight >= DEFAULT_WEIGHT)
    .map((w) => w.topic)

  return NextResponse.json({
    name: user.name,
    email: user.email,
    editionHour: user.editionHour,
    language: (user as { language?: string }).language ?? 'pt-BR',
    selectedTopics,
  })
}

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json() as {
    name?: string
    email?: string
    editionHour?: number
    language?: string
    topics?: string[]
  }

  // Atualiza dados básicos do usuário
  const updateData: { name?: string; email?: string; editionHour?: number; language?: string } = {}
  if (body.name !== undefined) updateData.name = body.name
  if (body.email !== undefined) updateData.email = body.email
  if (body.editionHour !== undefined) updateData.editionHour = body.editionHour
  if (body.language !== undefined) updateData.language = body.language

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({ where: { id: userId }, data: updateData })
  }

  // Atualiza tópicos se fornecidos
  let editionInvalidated = false
  if (body.topics) {
    const weightOps = ALL_TOPICS.map((topic) =>
      prisma.userTopicWeight.upsert({
        where: { userId_topic: { userId, topic } },
        update: { weight: body.topics!.includes(topic) ? DEFAULT_WEIGHT : UNSELECTED_WEIGHT },
        create: { userId, topic, weight: body.topics!.includes(topic) ? DEFAULT_WEIGHT : UNSELECTED_WEIGHT },
      })
    )
    await prisma.$transaction(weightOps)
    editionInvalidated = true
  }

  // Invalida edição de hoje se língua ou tópicos mudaram (resumos precisam ser regerados)
  if (body.language !== undefined || body.topics) {
    const today = new Date().toISOString().split('T')[0]
    await prisma.edition.deleteMany({ where: { userId, date: today } })
    editionInvalidated = true
  }

  return NextResponse.json({ ok: true, editionInvalidated })
}
