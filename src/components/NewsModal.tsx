'use client'

import { useEffect, useState } from 'react'

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
  item: NewsItem
  onClose: () => void
}

function timeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 60) return `${minutes} min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

export default function NewsModal({ item, onClose }: Props) {
  const [questions, setQuestions] = useState<string[]>([])
  const [loadingQ, setLoadingQ] = useState(true)

  // Fecha com ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Trava scroll do body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Busca perguntas ao abrir
  useEffect(() => {
    setLoadingQ(true)
    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsItemId: item.id }),
    })
      .then((r) => r.json())
      .then((data) => setQuestions(data.questions ?? []))
      .catch(() => setQuestions([]))
      .finally(() => setLoadingQ(false))
  }, [item.id])

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 9000, background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-xl mx-auto overflow-y-auto"
        style={{
          background: '#F2F1ED',
          maxHeight: '90vh',
          borderTop: '1px solid #E0DED8',
          animation: 'slideUp 0.25s ease both',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
        `}</style>

        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid #E0DED8' }}
        >
          <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: '#9E9E9E' }}>
            {item.topic}
          </p>
          <button
            onClick={onClose}
            style={{ color: '#9E9E9E', lineHeight: 1 }}
            className="hover:text-[#111] transition-colors"
            aria-label="Fechar"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Imagem */}
        {item.imageUrl && (
          <div className="w-full" style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#E3E2DC' }}>
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLElement).parentElement!.style.display = 'none' }}
            />
          </div>
        )}

        {/* Conteúdo */}
        <div className="px-6 py-6">
          <h2
            className="text-xl font-bold leading-snug mb-4"
            style={{ color: '#111', letterSpacing: '-0.01em' }}
          >
            {item.normalizedTitle}
          </h2>

          {item.summary ? (
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#3A3A3A' }}>
              {item.summary}
            </p>
          ) : (
            <p className="text-sm mb-4 italic" style={{ color: '#9E9E9E' }}>
              Resumo não disponível para esta notícia.
            </p>
          )}

          <p className="text-xs mb-6" style={{ color: '#9E9E9E' }}>
            {item.sourceName}&ensp;·&ensp;{timeAgo(item.publishedAt)}
          </p>

          {/* Perguntas */}
          <div className="mb-6" style={{ borderTop: '1px solid #E0DED8', paddingTop: '20px' }}>
            <p className="text-[10px] uppercase tracking-[0.18em] mb-3" style={{ color: '#9E9E9E' }}>
              Explorar mais
            </p>

            {loadingQ ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: '38px',
                      background: '#E3E2DC',
                      borderRadius: '2px',
                      animation: 'pulse 1.4s ease infinite',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            ) : questions.length > 0 ? (
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <button
                    key={i}
                    className="w-full text-left text-sm py-2.5 px-3 transition-colors duration-150"
                    style={{
                      border: '1px solid #E0DED8',
                      color: '#3A3A3A',
                      background: 'transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#111'
                      e.currentTarget.style.color = '#111'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#E0DED8'
                      e.currentTarget.style.color = '#3A3A3A'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-5 py-3.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
            style={{ background: '#111' }}
          >
            <span>Ler artigo completo</span>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
