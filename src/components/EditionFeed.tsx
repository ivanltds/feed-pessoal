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
        {/* Linha de cima: marca + botão */}
        <div className="max-w-5xl mx-auto px-5 sm:px-8 flex items-center justify-between" style={{ height: '52px' }}>
          {/* Marca */}
          <div className="flex items-center gap-0">
            <span
              className="text-base font-bold tracking-tight select-none"
              style={{ color: '#111', letterSpacing: '-0.02em' }}
            >
              feed pessoal
            </span>
          </div>

          {/* Data — centro, só desktop */}
          <span
            className="hidden md:block text-xs capitalize"
            style={{ color: '#9E9E9E', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
          >
            {date}
          </span>

          {/* Botão de preferências */}
          <SettingsPanel />
        </div>

        {/* Data — só mobile, abaixo da primeira linha */}
        <div className="md:hidden px-5 pb-2">
          <span className="text-[11px] capitalize" style={{ color: '#9E9E9E' }}>{date}</span>
        </div>
      </header>

      {/* ── Feed ─────────────────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-12">

        {/* MOBILE: hero + lista compacta */}
        <div className="md:hidden">
          <div
            className="pb-6 mb-6"
            style={{ borderBottom: '1px solid #E0DED8' }}
            data-item-id={items[0]?.id}
          >
            {items[0] && <NewsCard item={items[0]} variant="hero" />}
          </div>

          <div>
            {items.slice(1).map((item, idx) => (
              <div
                key={item.id}
                data-item-id={item.id}
                style={idx < items.slice(1).length - 1 ? { borderBottom: '1px solid #E0DED8' } : {}}
              >
                <NewsCard item={item} variant="compact" />
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP: grade editorial */}
        <div className="hidden md:block">

          {/* Linha superior: hero (2/3) + sidebar (1/3) */}
          <div
            className="grid gap-10 pb-12 mb-12"
            style={{
              gridTemplateColumns: '2fr 1fr',
              borderBottom: '1px solid #E0DED8',
            }}
          >
            {/* Hero */}
            <div data-item-id={items[0]?.id}>
              {items[0] && <NewsCard item={items[0]} variant="hero" />}
            </div>

            {/* Sidebar: itens 2–3 */}
            <div className="flex flex-col gap-0" style={{ borderLeft: '1px solid #E0DED8', paddingLeft: '2.5rem' }}>
              {items.slice(1, 3).map((item, idx) => (
                <div
                  key={item.id}
                  data-item-id={item.id}
                  style={idx === 0 ? {} : { borderTop: '1px solid #E0DED8', paddingTop: '1.5rem' }}
                  className={idx === 0 ? '' : ''}
                >
                  <div className={idx === 0 ? '' : ''}>
                    <NewsCard item={item} variant="secondary" />
                  </div>
                  {idx === 0 && <div style={{ marginBottom: '1.5rem' }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Linha inferior: tiles */}
          <div className="grid grid-cols-4 gap-8">
            {items.slice(3).map((item) => (
              <div key={item.id} data-item-id={item.id}>
                <NewsCard item={item} variant="tile" />
              </div>
            ))}
          </div>
        </div>

        {/* Done screen */}
        {doneVisible && (
          <div className="max-w-lg mx-auto mt-16 sm:mt-20">
            <DoneScreen userId={userId} topItem={items[0]} />
          </div>
        )}
      </main>
    </div>
  )
}
