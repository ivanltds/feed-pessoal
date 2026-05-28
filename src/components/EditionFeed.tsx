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
  const lastCardRef = useRef<HTMLDivElement>(null)
  const readTimeRef = useRef<Record<string, number>>({})
  const enterTimeRef = useRef<Record<string, number>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.itemId
          if (!id) return
          if (entry.isIntersecting) {
            enterTimeRef.current[id] = Date.now()
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
  }, [])

  useEffect(() => {
    if (!lastCardRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setDoneVisible(true) },
      { threshold: 0.8 }
    )
    observer.observe(lastCardRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const sendFeedback = async () => {
      const events = items
        .map((item) => {
          const seconds = readTimeRef.current[item.id] ?? 0
          if (seconds > 20) return { newsItemId: item.id, topic: item.topic, type: 'long_read' }
          if (seconds < 5 && seconds > 0) return { newsItemId: item.id, topic: item.topic, type: 'skip' }
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
    <div className="min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 bg-[#f0f0ed]/95 backdrop-blur-sm border-b border-neutral-300" style={{ zIndex: 10 }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">feed pessoal</p>
            <h1 className="text-sm font-medium text-neutral-700 capitalize">{date}</h1>
          </div>
          <SettingsPanel />
        </div>
      </header>

      {/* ── Conteúdo ── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

        {/* Mobile: lista única / Desktop: grid 2-3 colunas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              data-item-id={item.id}
              ref={idx === items.length - 1 ? lastCardRef : undefined}
              className={
                // Primeiro card ocupa largura total no sm, 2 colunas no lg
                idx === 0
                  ? 'sm:col-span-2 lg:col-span-2'
                  : ''
              }
            >
              <NewsCard item={item} position={idx + 1} total={items.length} featured={idx === 0} />
            </div>
          ))}
        </div>

        {doneVisible && (
          <div className="max-w-xl mx-auto mt-8">
            <DoneScreen userId={userId} topItem={items[0]} />
          </div>
        )}
      </main>
    </div>
  )
}
