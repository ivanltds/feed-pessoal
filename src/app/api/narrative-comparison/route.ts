import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { compareNarratives } from '@/services/narrative-comparator'

export async function POST(req: NextRequest) {
  try {
    const { newsItemId } = (await req.json()) as { newsItemId?: string }
    if (!newsItemId) {
      return NextResponse.json({ error: 'newsItemId é obrigatório' }, { status: 400 })
    }

    const item = await prisma.newsItem.findUnique({
      where: { id: newsItemId },
      include: { edition: { include: { user: true } } }
    })

    if (!item) {
      return NextResponse.json({ error: 'Notícia não encontrada' }, { status: 404 })
    }

    const result = await compareNarratives({
      id: item.id,
      normalizedTitle: item.normalizedTitle,
      topic: item.topic,
      summary: item.summary,
      sourceName: item.sourceName,
      language: item.edition.user.language ?? 'pt-BR'
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[ApiNarrativeComparison] Erro:', error)
    return NextResponse.json({ error: 'Erro ao gerar comparação' }, { status: 500 })
  }
}
