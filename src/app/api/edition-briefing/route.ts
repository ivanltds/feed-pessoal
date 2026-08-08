import { NextRequest, NextResponse } from 'next/server'
import { generateEditionBriefing } from '@/services/edition-briefing-generator'

export async function POST(req: NextRequest) {
  try {
    const { editionId } = await req.json()
    if (!editionId) {
      return NextResponse.json({ error: 'editionId é obrigatório' }, { status: 400 })
    }

    const briefing = await generateEditionBriefing(editionId)
    return NextResponse.json(briefing)
  } catch (error) {
    console.error('[API EditionBriefing] Erro:', error)
    return NextResponse.json({ error: 'Erro ao gerar briefing' }, { status: 500 })
  }
}
