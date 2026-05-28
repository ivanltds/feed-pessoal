import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { applyFeedbackDeltas } from '@/services/ranker'

const DELTAS = {
  deep_dive_question: 2.0,
  long_read: 1.0,
  skip: -0.5,
}

export async function POST(req: NextRequest) {
  const { userId, events } = await req.json() as {
    userId: string
    events: { newsItemId: string; topic: string; type: 'deep_dive_question' | 'long_read' | 'skip' }[]
  }

  if (!userId || !events?.length) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  // busca pesos atuais
  const currentWeights = await prisma.userTopicWeight.findMany({ where: { userId } })
  const weightMap: Record<string, number> = {}
  currentWeights.forEach((w) => { weightMap[w.topic] = w.weight })

  // calcula novos pesos
  const updatedWeights = applyFeedbackDeltas(weightMap, events)

  // persiste pesos e eventos em transação
  await prisma.$transaction([
    // atualiza pesos
    ...Object.entries(updatedWeights).map(([topic, weight]) =>
      prisma.userTopicWeight.upsert({
        where: { userId_topic: { userId, topic } },
        update: { weight },
        create: { userId, topic, weight },
      })
    ),
    // registra eventos de feedback
    ...events.map((e) =>
      prisma.feedbackEvent.create({
        data: {
          userId,
          newsItemId: e.newsItemId,
          topic: e.topic,
          type: e.type,
          delta: DELTAS[e.type],
        },
      })
    ),
  ])

  return NextResponse.json({ ok: true })
}
