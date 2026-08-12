import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, subscription } = body

    if (!userId || !subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Dados de inscrição incompletos (userId e subscription são obrigatórios).' },
        { status: 400 }
      )
    }

    const { endpoint, keys } = subscription
    const { p256dh, auth } = keys

    if (!p256dh || !auth) {
      return NextResponse.json(
        { error: 'Chaves de criptografia p256dh e auth são obrigatórias.' },
        { status: 400 }
      )
    }

    const pushSub = await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId,
        p256dh,
        auth
      },
      create: {
        userId,
        endpoint,
        p256dh,
        auth
      }
    })

    return NextResponse.json({ success: true, subscriptionId: pushSub.id })
  } catch (error: any) {
    console.error('[API /api/push/subscribe] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar inscrição Web Push.' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint é obrigatório para cancelamento.' },
        { status: 400 }
      )
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API /api/push/subscribe DELETE] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao cancelar inscrição Web Push.' },
      { status: 500 }
    )
  }
}
