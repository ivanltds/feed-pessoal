import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const DEFAULT_WEIGHT = 5.0
const UNSELECTED_WEIGHT = 1.0

export async function POST(req: NextRequest) {
  const { email, name, topics, editionHour, language } = await req.json() as {
    email?: string
    name?: string
    topics: string[]
    editionHour: number
    language?: string
  }

  if (!topics?.length) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const ALL_TOPICS = ['Tecnologia', 'Economia', 'Geopolítica', 'Ciência', 'Brasil', 'Mundo', 'Cultura', 'Esportes']
  const userData = {
    name: name || undefined,
    editionHour,
    language: language ?? 'pt-BR',
  }

  // Se email fornecido: upsert por email (preserva conta existente)
  // Se não: cria usuário novo sem email
  let user
  if (email) {
    user = await prisma.user.upsert({
      where: { email },
      update: { ...userData, email },
      create: { email, ...userData },
    })
  } else {
    user = await prisma.user.create({
      data: userData,
    })
  }

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

  const response = NextResponse.json({ userId: user.id })
  response.cookies.set('userId', user.id, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 ano
    httpOnly: false,
    sameSite: 'lax',
  })
  return response
}
