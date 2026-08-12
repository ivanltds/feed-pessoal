'use client'

import { useState, useEffect, useCallback } from 'react'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState<boolean>(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [isIos, setIsIos] = useState<boolean>(false)
  const [isStandalone, setIsStandalone] = useState<boolean>(false)

  // Checa suporte do navegador e permissões ao carregar
  useEffect(() => {
    if (typeof window === 'undefined') return

    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    setIsSupported(supported)

    const userAgent = window.navigator.userAgent.toLowerCase()
    const iosDevice = /iphone|ipad|ipod/.test(userAgent)
    setIsIos(iosDevice)

    const standaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
    setIsStandalone(standaloneMode)

    if (supported) {
      setPermission(Notification.permission)

      // Registra Service Worker se suportado
      navigator.serviceWorker.register('/sw.js').then(async (reg) => {
        const sub = await reg.pushManager.getSubscription()
        setIsSubscribed(!!sub)
        setLoading(false)
      }).catch((err) => {
        console.error('[usePushNotifications] Erro ao registrar SW:', err)
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  // Inscrever usuário em Notificações Push
  const subscribeUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!isSupported) {
      alert('Seu navegador não suporta Notificações Push.')
      return false
    }

    setLoading(true)

    try {
      // 1. Pedir permissão
      const permResult = await Notification.requestPermission()
      setPermission(permResult)

      if (permResult !== 'granted') {
        alert('Permissão de notificação negada.')
        setLoading(false)
        return false
      }

      // 2. Obter VAPID key
      const keyRes = await fetch('/api/push/vapid-key')
      const { publicKey } = await keyRes.json()

      if (!publicKey) {
        throw new Error('Chave VAPID pública não encontrada no servidor.')
      }

      // 3. Obter registro do Service Worker
      const reg = await navigator.serviceWorker.ready
      const applicationServerKey = urlBase64ToUint8Array(publicKey)

      // 4. Inscrever no PushManager
      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        })
      }

      // 5. Enviar subscrição para o backend
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          subscription: sub.toJSON()
        })
      })

      if (!res.ok) {
        throw new Error('Falha ao registrar inscrição no servidor.')
      }

      setIsSubscribed(true)
      setLoading(false)
      return true
    } catch (error: any) {
      console.error('[usePushNotifications] Erro ao inscrever:', error)
      alert(error.message || 'Erro ao ativar notificações push.')
      setLoading(false)
      return false
    }
  }, [isSupported])

  // Desinscrever usuário
  const unsubscribeUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!isSupported) return false
    setLoading(true)

    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()

      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            endpoint: sub.endpoint
          })
        })

        await sub.unsubscribe()
      }

      setIsSubscribed(false)
      setLoading(false)
      return true
    } catch (error) {
      console.error('[usePushNotifications] Erro ao desinscrever:', error)
      setLoading(false)
      return false
    }
  }, [isSupported])

  // Disparar notificação de teste
  const sendTestNotification = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/push/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Erro ao disparar notificação de teste.')
        return false
      }

      return true
    } catch (error: any) {
      console.error('[usePushNotifications] Erro no teste:', error)
      alert('Erro de rede ao disparar teste.')
      return false
    }
  }, [])

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    isIos,
    isStandalone,
    subscribeUser,
    unsubscribeUser,
    sendTestNotification
  }
}
