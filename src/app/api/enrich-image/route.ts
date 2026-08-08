import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enrichNewsImage } from '@/services/image-enricher'

export async function POST(req: NextRequest) {
  try {
    const { newsItemId } = await req.json()
    if (!newsItemId) {
      return NextResponse.json({ error: 'newsItemId é obrigatório' }, { status: 400 })
    }

    const item = await prisma.newsItem.findUnique({ where: { id: newsItemId } })
    if (!item) {
      return NextResponse.json({ error: 'Notícia não encontrada' }, { status: 404 })
    }

    // Se já tem imagem original, não altera
    if (item.imageUrl) {
      return NextResponse.json({
        imageUrl: item.imageUrl,
        isAiSelectedImage: false,
        relevanceScore: 'HIGH'
      })
    }

    const result = await enrichNewsImage({
      id: item.id,
      normalizedTitle: item.normalizedTitle,
      topic: item.topic,
      summary: item.summary
    })

    return NextResponse.json(result ?? { error: 'Não foi possível atribuir imagem' })
  } catch (error) {
    console.error('[API EnrichImage] Erro:', error)
    return NextResponse.json({ error: 'Erro no servidor' }, { status: 500 })
  }
}
