import { NextRequest, NextResponse } from 'next/server'
import { sendPushNotificationToUser } from '@/lib/push-sender'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 })
    }

    const result = await sendPushNotificationToUser(userId, {
      title: 'feed pessoal 📰',
      body: 'Notificações ativas! Você receberá alertas quando sua edição diária estiver pronta.',
      url: '/',
      tag: 'test-notification'
    })

    if (result.successCount === 0 && result.failureCount === 0) {
      return NextResponse.json(
        { error: 'Nenhum dispositivo cadastrado para este usuário.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      delivered: result.successCount,
      failed: result.failureCount
    })
  } catch (error: any) {
    console.error('[API /api/push/test] Erro:', error)
    return NextResponse.json(
      { error: 'Erro ao disparar notificação de teste.' },
      { status: 500 }
    )
  }
}
