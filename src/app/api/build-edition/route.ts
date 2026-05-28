import { NextRequest, NextResponse } from 'next/server'
import { buildEditionForUser } from '@/services/edition-builder'

// Aumenta o timeout para 60s nessa rota específica
export const maxDuration = 60

export async function POST(req: NextRequest) {
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })

  try {
    await buildEditionForUser(userId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[build-edition] Erro:', err)
    return NextResponse.json({ error: 'Falha ao construir edição' }, { status: 500 })
  }
}
