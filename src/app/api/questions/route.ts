import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSuggestedQuestions } from '@/services/question-generator'

export async function POST(req: NextRequest) {
  const { newsItemId } = await req.json()

  const item = await prisma.newsItem.findUnique({ where: { id: newsItemId } })
  if (!item) return NextResponse.json({ questions: [] })

  const questions = await generateSuggestedQuestions({
    id: item.id,
    topic: item.topic,
    normalizedTitle: item.normalizedTitle,
    summary: null,
  })

  return NextResponse.json({ questions })
}
