// Service Worker do feed pessoal
const CACHE_NAME = 'feed-pessoal-v1'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

// Manipulação do evento Push
self.addEventListener('push', (event) => {
  let data = {}
  if (event.data) {
    try {
      data = event.data.json()
    } catch (e) {
      data = {
        title: 'feed pessoal 📰',
        body: event.data.text()
      }
    }
  }

  const title = data.title || 'feed pessoal 📰'
  const options = {
    body: data.body || 'Sua edição diária personalizada está pronta.',
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    data: {
      url: data.url || '/'
    },
    tag: data.tag || 'feed-pessoal-edition',
    renotify: true,
    vibrate: [100, 50, 100]
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Manipulação do clique na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          if (client.url.includes(targetUrl)) {
            return client.focus()
          }
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
