import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateWeeklyDigest } from '@/services/weekly-digest-generator'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não identificado' }, { status: 401 })
    }

    const digest = await generateWeeklyDigest(userId)
    return NextResponse.json(digest)
  } catch (error) {
    console.error('[API WeeklyDigest] Erro:', error)
    return NextResponse.json({ error: 'Erro ao gerar digest' }, { status: 500 })
  }
}
