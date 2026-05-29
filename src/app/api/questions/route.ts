import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { generateSuggestedQuestions } from '@/services/question-generator'

export async function POST(req: NextRequest) {
  const { newsItemId } = await req.json()

  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  const [item, user] = await Promise.all([
    prisma.newsItem.findUnique({ where: { id: newsItemId } }),
    userId ? prisma.user.findUnique({ where: { id: userId }, select: { language: true } }) : null,
  ])

  if (!item) return NextResponse.json({ questions: [] })

  const questions = await generateSuggestedQuestions({
    id: item.id,
    topic: item.topic,
    normalizedTitle: item.normalizedTitle,
    summary: item.summary,
    language: user?.language ?? 'pt-BR',
  })

  return NextResponse.json({ questions: questions.map((q) => q.text) })
}
