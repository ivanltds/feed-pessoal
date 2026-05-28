'use client'

import { useEffect, useRef, useState } from 'react'
import NewsCard from './NewsCard'
import DoneScreen from './DoneScreen'

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

  // rastreia tempo de leitura por card
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

  // detecta fim da edição
  useEffect(() => {
    if (!lastCardRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setDoneVisible(true) },
      { threshold: 0.8 }
    )
    observer.observe(lastCardRef.current)
    return () => observer.disconnect()
  }, [])

  // envia feedback de leitura ao sair
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
    <main className="max-w-xl mx-auto px-4 pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-[#f0f0ed]/95 backdrop-blur-sm py-4 mb-2 z-10 border-b border-neutral-300">
        <p className="text-xs text-neutral-400 uppercase tracking-widest">feed pessoal</p>
        <h1 className="text-base font-medium text-neutral-700 capitalize">{date}</h1>
      </div>

      {/* Cards da edição */}
      <div className="space-y-4 pt-2">
        {items.map((item, idx) => (
          <div
            key={item.id}
            data-item-id={item.id}
            ref={idx === items.length - 1 ? lastCardRef : undefined}
          >
            <NewsCard item={item} position={idx + 1} total={items.length} />
          </div>
        ))}
      </div>

      {/* Tela de conclusão */}
      {doneVisible && (
        <DoneScreen userId={userId} topItem={items[0]} />
      )}
    </main>
  )
}
