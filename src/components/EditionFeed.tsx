'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import NewsCard from './NewsCard'
import DoneScreen from './DoneScreen'
import SettingsPanel from './SettingsPanel'
import WeeklyDigestModal from './WeeklyDigestModal'

interface NewsItem {
  id: string
  topic: string
  sourceName: string
  normalizedTitle: string
  summary?: string | null
  imageUrl: string | null
  url: string
  publishedAt: Date
  score?: number
}

interface Props {
  items: NewsItem[]
  editionId: string
  date: string
  userId: string
}

export default function EditionFeed({ items, editionId, date, userId }: Props) {
  const router = useRouter()
  const [doneVisible, setDoneVisible] = useState(false)
  const [rebuilding, setRebuilding] = useState(false)
  const [showWeeklyModal, setShowWeeklyModal] = useState(false)
  const readTimeRef = useRef<Record<string, number>>({})
  const enterTimeRef = useRef<Record<string, number>>({})

  const handleRebuild = useCallback(async () => {
    setRebuilding(true)
    try {
      await fetch('/api/rebuild-edition', { method: 'POST' })
      router.refresh()
    } finally {
      setRebuilding(false)
    }
  }, [router])
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

  // Hero = primeiro item; restante agrupado por tópico
  const hero = items[0]
  const rest = items.slice(1)

  const byTopic: Record<string, NewsItem[]> = {}
  for (const item of rest) {
    if (!byTopic[item.topic]) byTopic[item.topic] = []
    byTopic[item.topic].push(item)
  }

  // Ordena tópicos pelo score médio dos seus itens
  const topicOrder = Object.keys(byTopic).sort((a, b) => {
    const avgScore = (items: NewsItem[]) =>
      items.reduce((s, i) => s + (i.score ?? 0), 0) / items.length
    return avgScore(byTopic[b]) - avgScore(byTopic[a])
  })

  const sidebarItems = topicOrder[0] ? byTopic[topicOrder[0]].slice(0, 2) : []

  return (
    <div className="min-h-screen" style={{ background: '#F2F1ED' }}>

      {/* Header */}
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
          <div className="flex items-center gap-3">
            <span
              className="text-base font-bold tracking-tight select-none"
              style={{ color: '#111', letterSpacing: '-0.02em' }}
            >
              feed pessoal
            </span>

            <button
              onClick={() => setShowWeeklyModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-[#EAE8E1] hover:bg-[#E0DED8] text-[#333] transition-colors font-medium"
            >
              <span>🗓️ Retrospectiva Semanal</span>
            </button>
          </div>

          <span
            className="hidden md:block text-xs capitalize"
            style={{ color: '#9E9E9E', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
          >
            {date}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRebuild}
              disabled={rebuilding}
              className="text-xs transition-opacity"
              style={{ color: '#9E9E9E', opacity: rebuilding ? 0.4 : 1 }}
              title="Recriar o feed do zero"
            >
              {rebuilding ? 'Recriando…' : '↺ Recriar feed'}
            </button>
            <SettingsPanel />
          </div>
        </div>

        <div className="md:hidden px-5 pb-2 flex items-center justify-between">
          <span className="text-[11px] capitalize text-[#9E9E9E]">{date}</span>
          <button
            onClick={() => setShowWeeklyModal(true)}
            className="text-[11px] text-[#333] underline font-medium"
          >
            Retrospectiva Semanal
          </button>
        </div>
      </header>

      {/* Main Feed */}
      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-6 sm:py-8">

        {/* Banner de Transparência da IA & Economia de Tempo (Oportunidade 2) */}
        <div className="mb-8 p-3.5 sm:p-4 rounded-xl bg-[#FFF] border border-[#E5E3DC] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <div>
              <p className="text-xs font-semibold text-[#111]">
                Curadoria IA Ativa para Hoje
              </p>
              <p className="text-xs text-[#666]">
                Analisamos centenas de artigos RSS e selecionamos os <strong>{items.length} mais relevantes</strong> para o seu perfil.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-[#F2F1ED] text-[#444] shrink-0">
            ~45 min economizados
          </span>
        </div>

        {/* Bloco hero */}
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

        {/* Seções por tópico */}
        {topicOrder.map((topic, topicIdx) => {
          const allItems = byTopic[topic]
          const desktopItems = topicIdx === 0 ? allItems.slice(2) : allItems

          const withPhoto  = desktopItems.filter(i => i.imageUrl)
          const noPhoto    = desktopItems.filter(i => !i.imageUrl)

          const COLS = 4
          const orphans = withPhoto.length % COLS
          const getColSpan = (idx: number) => {
            if (orphans === 0) return 1
            const firstOrphanIdx = withPhoto.length - orphans
            if (idx < firstOrphanIdx) return 1
            return Math.floor(COLS / orphans)
          }

          return (
            <div key={topic} className="mb-12 sm:mb-16">
              {/* Cabeçalho da seção */}
              <div className="mb-5 pb-3" style={{ borderBottom: '1px solid #E0DED8' }}>
                <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#9E9E9E' }}>
                  {topic}
                </p>
              </div>

              {/* Desktop */}
              <div className="hidden md:block">
                {withPhoto.length > 0 && (
                  <div className="grid grid-cols-4 gap-8 mb-0">
                    {withPhoto.map((item, idx) => {
                      const span = getColSpan(idx)
                      return (
                        <div
                          key={item.id}
                          data-item-id={item.id}
                          style={{ gridColumn: span > 1 ? `span ${span}` : undefined }}
                        >
                          <NewsCard item={item} variant={span >= 2 ? 'secondary' : 'tile'} />
                        </div>
                      )
                    })}
                  </div>
                )}

                {noPhoto.length > 0 && (
                  <div style={{ marginTop: withPhoto.length > 0 ? '2rem' : 0 }}>
                    {noPhoto.map((item, idx) => (
                      <div
                        key={item.id}
                        data-item-id={item.id}
                        style={{
                          borderTop: idx === 0 && withPhoto.length === 0 ? 'none' : '1px solid #E0DED8',
                        }}
                      >
                        <NewsCard item={item} variant="compact" />
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
          <div className="max-w-xl mx-auto mt-10 sm:mt-16">
            <DoneScreen userId={userId} topItem={items[0]} editionId={editionId} />
          </div>
        )}
      </main>

      {/* Modal de Retrospectiva Semanal */}
      {showWeeklyModal && <WeeklyDigestModal onClose={() => setShowWeeklyModal(false)} />}
    </div>
  )
}
