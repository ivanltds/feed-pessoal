import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(
      `mailto:suporte@${new URL(appUrl).hostname || 'feedpessoal.app'}`,
      vapidPublicKey,
      vapidPrivateKey
    )
  } catch (error) {
    console.error('[PushSender] Erro ao configurar VAPID details:', error)
  }
}

export interface PushNotificationPayload {
  title: string
  body: string
  url?: string
  icon?: string
  badge?: string
  tag?: string
}

export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ successCount: number; failureCount: number }> {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId }
  })

  if (subscriptions.length === 0) {
    return { successCount: 0, failureCount: 0 }
  }

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url || '/',
    icon: payload.icon || '/icon.svg',
    badge: payload.badge || '/icon.svg',
    tag: payload.tag || 'feed-pessoal-push'
  })

  let successCount = 0
  let failureCount = 0

  await Promise.all(
    subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      }

      try {
        await webpush.sendNotification(pushSubscription, notificationPayload)
        successCount++
      } catch (err: any) {
        failureCount++
        console.warn(`[PushSender] Erro ao enviar push para endpoint ${sub.endpoint.slice(0, 30)}...:`, err.statusCode || err.message)

        // Se o endpoint expirou ou foi removido do browser (404 ou 410)
        if (err.statusCode === 404 || err.statusCode === 410) {
          try {
            await prisma.pushSubscription.delete({
              where: { endpoint: sub.endpoint }
            })
            console.log(`[PushSender] Inscrição expirada removida do banco: ${sub.id}`)
          } catch (deleteErr) {
            console.error('[PushSender] Erro ao deletar inscrição expirada:', deleteErr)
          }
        }
      }
    })
  )

  return { successCount, failureCount }
}
