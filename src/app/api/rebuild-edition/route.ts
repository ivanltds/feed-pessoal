import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { buildEditionForUser } from '@/services/edition-builder'

export const maxDuration = 60

export async function POST() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  if (!userId) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  // apaga a edição de hoje para forçar rebuild completo
  const today = new Date().toISOString().split('T')[0]
  await prisma.edition.deleteMany({ where: { userId, date: today } })

  const result = await buildEditionForUser(userId)
  if (result === 'no_topics') return NextResponse.json({ error: 'no_topics' }, { status: 422 })
  if (result === 'no_items')  return NextResponse.json({ error: 'no_items' }, { status: 422 })

  return NextResponse.json({ ok: true })
}
