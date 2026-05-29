'use client'

import { useEffect, useRef, useState } from 'react'
import NewsCard from './NewsCard'
import DoneScreen from './DoneScreen'
import SettingsPanel from './SettingsPanel'

interface NewsItem {
  id: string
  topic: string
  sourceName: string
  normalizedTitle: string
  summary?: string | null
  imageUrl: string | null
  url: string
  publishedAt: Date
}

interface Props {
  items: NewsItem[]
  editionId: string
  date: string
  userId: string
}

export default function EditionFeed({ items, date, userId }: Props) {
  const [doneVisible, setDoneVisible] = useState(false)
  const readTimeRef = useRef<Record<string, number>>({})
  const enterTimeRef = useRef<Record<string, number>>({})
  const lastItemId = items[items.length - 1]?.id

  // Rastreia tempo de leitura + detecta último card visível
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement
          const id = el.dataset.itemId
          if (!id) return
          if (entry.isIntersecting) {
            enterTimeRef.current[id] = Date.now()
            if (id === lastItemId) setDoneVisible(true)
          } else {
            if (enterTimeRef.current[id]) {
              const elapsed = (Date.now() - enterTimeRef.current[id]) / 1000
              readTimeRef.current[id] = (readTimeRef.current[id] ?? 0) + elapsed
              delete enterTimeRef.current[id]
            }
          }
        })
      },
      { threshold: 0.5 }
    )
    document.querySelectorAll('[data-item-id]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [lastItemId])

  // Envia feedback ao sair
  useEffect(() => {
    const sendFeedback = async () => {
      const events = items
        .map((item) => {
          const seconds = readTimeRef.current[item.id] ?? 0
          if (seconds > 20) return { newsItemId: item.id, topic: item.topic, type: 'long_read' }
          if (seconds > 0 && seconds < 5) return { newsItemId: item.id, topic: item.topic, type: 'skip' }
          return null
        })
        .filter(Boolean)
      if (events.length > 0) {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, events }),
          keepalive: true,
        })
      }
    }
    window.addEventListener('beforeunload', sendFeedback)
    return () => window.removeEventListener('beforeunload', sendFeedback)
  }, [items, userId])

  // Hero = primeiro item; restante agrupado por tópico (mantendo ordem de chegada)
  const hero = items[0]
  const rest = items.slice(1)

  const topicOrder: string[] = []
  const byTopic: Record<string, NewsItem[]> = {}
  for (const item of rest) {
    if (!byTopic[item.topic]) {
      topicOrder.push(item.topic)
      byTopic[item.topic] = []
    }
    byTopic[item.topic].push(item)
  }

  // No desktop, o primeiro tópico aparece como sidebar do hero (os 2 primeiros itens)
  const sidebarItems = topicOrder[0] ? byTopic[topicOrder[0]].slice(0, 2) : []

  return (
    <div className="min-h-screen" style={{ background: '#F2F1ED' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          background: '#F2F1ED',
          borderBottom: '1px solid #E0DED8',
          zIndex: 1000,
        }}
      >
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex items-center justify-between" style={{ height: '52px' }}>
          <span
            className="text-base font-bold tracking-tight select-none"
            style={{ color: '#111', letterSpacing: '-0.02em' }}
          >
            feed pessoal
          </span>

          <span
            className="hidden md:block text-xs capitalize"
            style={{ color: '#9E9E9E', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
          >
            {date}
          </span>

          <SettingsPanel />
        </div>

        <div className="md:hidden px-5 pb-2">
          <span className="text-[11px] capitalize" style={{ color: '#9E9E9E' }}>{date}</span>
        </div>
      </header>

      {/* ── Feed ─────────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">

        {/* ── Bloco hero ─────────────────────────────────────────────────── */}
        {hero && (
          <div className="pb-10 mb-10" style={{ borderBottom: '1px solid #E0DED8' }}>

            {/* Desktop: hero (2/3) + sidebar do 1º tópico (1/3) */}
            <div className="hidden md:grid gap-10" style={{ gridTemplateColumns: '2fr 1fr' }}>
              <div data-item-id={hero.id}>
                <NewsCard item={hero} variant="hero" />
              </div>

              {sidebarItems.length > 0 && (
                <div className="flex flex-col" style={{ borderLeft: '1px solid #E0DED8', paddingLeft: '2.5rem' }}>
                  {sidebarItems.map((item, idx) => (
                    <div
                      key={item.id}
                      data-item-id={item.id}
                      style={idx > 0 ? { borderTop: '1px solid #E0DED8', paddingTop: '1.5rem', marginTop: '1.5rem' } : {}}
                    >
                      <NewsCard item={item} variant="secondary" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: só o hero */}
            <div className="md:hidden" data-item-id={hero.id}>
              <NewsCard item={hero} variant="hero" />
            </div>
          </div>
        )}

        {/* ── Seções por tópico ──────────────────────────────────────────── */}
        {topicOrder.map((topic, topicIdx) => {
          const allItems = byTopic[topic]
          // No desktop, primeiros 2 itens do 1º tópico já estão no sidebar
          const desktopItems = topicIdx === 0 ? allItems.slice(2) : allItems

          return (
            <div key={topic} className="mb-12 sm:mb-16">
              {/* Cabeçalho da seção */}
              <div className="mb-5 pb-3" style={{ borderBottom: '1px solid #E0DED8' }}>
                <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#9E9E9E' }}>
                  {topic}
                </p>
              </div>

              {/* Desktop: grid de tiles */}
              <div className="hidden md:block">
                {desktopItems.length > 0 && (
                  <div className="grid grid-cols-4 gap-8">
                    {desktopItems.map((item) => (
                      <div key={item.id} data-item-id={item.id}>
                        <NewsCard item={item} variant="tile" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile: lista compacta */}
              <div className="md:hidden">
                {allItems.map((item, idx) => (
                  <div
                    key={item.id}
                    data-item-id={item.id}
                    style={idx < allItems.length - 1 ? { borderBottom: '1px solid #E0DED8' } : {}}
                  >
                    <NewsCard item={item} variant="compact" />
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Done screen */}
        {doneVisible && (
          <div className="max-w-lg mx-auto mt-10 sm:mt-16">
            <DoneScreen userId={userId} topItem={items[0]} />
          </div>
        )}
      </main>
    </div>
  )
}
