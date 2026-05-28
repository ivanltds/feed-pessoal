import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_WEIGHT = 5.0
const UNSELECTED_WEIGHT = 1.0

export async function POST(req: NextRequest) {
  const { email, name, topics, editionHour } = await req.json() as {
    email: string
    name?: string
    topics: string[]
    editionHour: number
  }

  if (!email || !topics?.length) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const ALL_TOPICS = ['Tecnologia', 'Economia', 'Geopolítica', 'Ciência', 'Brasil', 'Mundo', 'Cultura', 'Esportes']

  // cria ou atualiza usuário
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: name ?? undefined, editionHour },
    create: { email, name: name ?? undefined, editionHour },
  })

  // inicializa pesos: selecionados = 5, demais = 1
  const weightOps = ALL_TOPICS.map((topic) =>
    prisma.userTopicWeight.upsert({
      where: { userId_topic: { userId: user.id, topic } },
      update: {},  // não sobrescreve se já existe (preserva aprendizado)
      create: {
        userId: user.id,
        topic,
        weight: topics.includes(topic) ? DEFAULT_WEIGHT : UNSELECTED_WEIGHT,
      },
    })
  )

  await prisma.$transaction(weightOps)

  return NextResponse.json({ userId: user.id })
}
