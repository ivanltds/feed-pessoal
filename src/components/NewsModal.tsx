'use client'

import { useEffect, useState } from 'react'
import type { NewsPerspective } from '@/services/perspective-generator'
import { useDeepDive } from '@/hooks/useDeepDive'

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
  const [perspectives, setPerspectives] = useState<NewsPerspective[]>([])
  const [loadingP, setLoadingP] = useState(true)
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const { openQuestion } = useDeepDive()

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

  // Busca perspectivas ao abrir
  useEffect(() => {
    setLoadingP(true)
    fetch('/api/perspectives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsItemId: item.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        const list: NewsPerspective[] = data.perspectives ?? []
        setPerspectives(list)
        if (list.length > 0) setActiveTab(list[0].type)
      })
      .catch(() => setPerspectives([]))
      .finally(() => setLoadingP(false))
  }, [item.id])

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 9000, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-xl mx-auto overflow-y-auto"
        style={{
          background: '#F8F7F4',
          maxHeight: '92vh',
          borderRadius: '12px 12px 0 0',
          borderTop: '1px solid #E0DED8',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
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
          style={{ borderBottom: '1px solid #EAE8E1' }}
        >
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded"
            style={{ background: '#EAE8E1', color: '#4A4A4A' }}
          >
            {item.topic}
          </span>
          <button
            onClick={onClose}
            style={{ color: '#888', lineHeight: 1 }}
            className="hover:text-[#111] transition-colors p-1 rounded-full hover:bg-[#EAE8E1]"
            aria-label="Fechar"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Imagem (apenas se for válida) */}
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
            className="text-xl sm:text-2xl font-bold leading-snug mb-3"
            style={{ color: '#111', letterSpacing: '-0.015em' }}
          >
            {item.normalizedTitle}
          </h2>

          {item.summary ? (
            <p className="text-sm leading-relaxed mb-4 text-[#333]">
              {item.summary}
            </p>
          ) : (
            <p className="text-sm mb-4 italic text-[#888]">
              Resumo gerado em breve.
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-[#888] mb-6">
            <span className="font-medium text-[#555]">{item.sourceName}</span>
            <span>·</span>
            <span>{timeAgo(item.publishedAt)}</span>
          </div>

          {/* Perspectivas 360° */}
          <div className="mb-6 rounded-lg p-4" style={{ background: '#FFF', border: '1px solid #E5E3DC' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#666]">
                🔍 Perspectivas 360° (Análise IA)
              </p>
              <span className="text-[10px] text-[#999]">Leitura em 1 clique</span>
            </div>

            {loadingP ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: '42px',
                      background: '#F0EFEA',
                      borderRadius: '6px',
                      animation: 'pulse 1.4s ease infinite',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            ) : perspectives.length > 0 ? (
              <div className="space-y-2">
                {/* Selector de Abas */}
                <div className="flex gap-1.5 p-1 rounded-md mb-3" style={{ background: '#F2F1ED' }}>
                  {perspectives.map((p) => {
                    const isActive = activeTab === p.type
                    return (
                      <button
                        key={p.type}
                        onClick={() => setActiveTab(p.type)}
                        className="flex-1 py-1.5 px-2 rounded text-xs font-medium transition-all text-center"
                        style={{
                          background: isActive ? '#FFF' : 'transparent',
                          color: isActive ? '#111' : '#666',
                          boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        }}
                      >
                        {p.badge}
                      </button>
                    )
                  })}
                </div>

                {/* Conteúdo da Aba Ativa */}
                {perspectives
                  .filter((p) => p.type === activeTab)
                  .map((p) => (
                    <div
                      key={p.type}
                      className="p-3.5 rounded-md transition-all"
                      style={{ background: '#FBFBFA', border: '1px solid #EAE8E1' }}
                    >
                      <h4 className="text-sm font-semibold text-[#111] mb-1">{p.title}</h4>
                      <p className="text-xs text-[#444] leading-relaxed mb-3">{p.summary}</p>
                      
                      <button
                        onClick={() => openQuestion({
                          id: `p-${item.id}-${p.type}`,
                          text: `Me conte mais sobre a perspectiva '${p.title}' da notícia '${item.normalizedTitle}'`,
                          topic: item.topic,
                          newsItemId: item.id
                        })}
                        className="text-[11px] font-medium text-[#111] underline hover:text-[#555] flex items-center gap-1"
                      >
                        <span>Aprofundar no chat</span>
                        <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-[#888]">Perspectivas indisponíveis para este artigo.</p>
            )}
          </div>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-5 py-3.5 text-sm font-medium text-white rounded-md transition-opacity hover:opacity-90 shadow-sm"
            style={{ background: '#111' }}
          >
            <span>Ler matéria original</span>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
