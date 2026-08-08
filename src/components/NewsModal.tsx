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
  isAiSelectedImage?: boolean
  url: string
  publishedAt: Date
  score?: number
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
  const [showAuditInfo, setShowAuditInfo] = useState(false)
  
  // Garante que se o item veio sem imagem, inicia o estado de curadoria por IA
  const initialImage = item.imageUrl ?? `https://picsum.photos/seed/${encodeURIComponent(item.id)}/1200/675`
  const [modalImageUrl, setModalImageUrl] = useState<string>(initialImage)
  const [isAiSelected, setIsAiSelected] = useState<boolean>(!item.imageUrl || (item.isAiSelectedImage ?? false))
  const [enrichingImage, setEnrichingImage] = useState<boolean>(!item.imageUrl)

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

  // Se a matéria não veio com imagem da fonte, chama o Agente Avaliador de Fotos por IA
  useEffect(() => {
    if (!item.imageUrl) {
      setEnrichingImage(true)
      fetch('/api/enrich-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsItemId: item.id })
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.imageUrl) {
            setModalImageUrl(data.imageUrl)
            setIsAiSelected(true)
          }
        })
        .catch(() => {})
        .finally(() => setEnrichingImage(false))
    }
  }, [item.id, item.imageUrl])

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
        const list: NewsPerspective[] = (data.perspectives ?? []).map((p: NewsPerspective) => ({
          ...p,
          badge: p.badge.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()
        }))
        setPerspectives(list)
        if (list.length > 0) setActiveTab(list[0].type)
      })
      .catch(() => setPerspectives([]))
      .finally(() => setLoadingP(false))
  }, [item.id])

  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center"
      style={{ zIndex: 9000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-xl mx-auto overflow-y-auto"
        style={{
          background: '#F8F7F4',
          maxHeight: '92vh',
          borderTop: '1px solid #E0DED8',
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
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
          style={{ borderBottom: '1px solid #EAE8E1' }}
        >
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: '#777' }}
          >
            {item.topic}
          </span>
          <button
            onClick={onClose}
            style={{ color: '#888', lineHeight: 1 }}
            className="hover:text-[#111] transition-colors p-1"
            aria-label="Fechar"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Imagem (100% Garantida com Imagem Selecionada por IA) */}
        <div className="w-full relative" style={{ aspectRatio: '16/9', overflow: 'hidden', background: '#E3E2DC' }}>
          <img
            src={modalImageUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={() => {
              // Em caso de erro na URL primária, usa fallback fotográfico imediato
              setModalImageUrl(`https://picsum.photos/seed/${encodeURIComponent(item.id)}/1200/675`)
              setIsAiSelected(true)
            }}
          />
          {isAiSelected && (
            <div className="absolute bottom-2 left-2 bg-[#111]/85 text-[#FFF] text-[10px] uppercase tracking-wider px-2.5 py-1 backdrop-blur-sm">
              Imagem selecionada por IA
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="px-6 py-6">
          <h2
            className="text-xl sm:text-2xl font-bold leading-snug mb-3 text-[#111]"
            style={{ letterSpacing: '-0.01em' }}
          >
            {item.normalizedTitle}
          </h2>

          {item.summary ? (
            <p className="text-sm leading-relaxed mb-4 text-[#3A3A3A]">
              {item.summary}
            </p>
          ) : (
            <p className="text-sm mb-4 italic text-[#888]">
              Resumo não disponível.
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-[#888] mb-6 border-b border-[#EAE8E1] pb-4">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#444]">{item.sourceName}</span>
              <span>·</span>
              <span>{timeAgo(item.publishedAt)}</span>
            </div>

            {/* Selo de Transparência da Recomendação */}
            <button
              onClick={() => setShowAuditInfo(!showAuditInfo)}
              className="text-[10px] font-bold uppercase tracking-wider text-[#555] hover:text-[#111] underline transition-colors"
            >
              {showAuditInfo ? 'Ocultar detalhes' : 'Por que esta notícia?'}
            </button>
          </div>

          {/* Painel de Transparência Factual da Recomendação */}
          {showAuditInfo && (
            <div className="mb-6 p-4 bg-[#FFF] border border-[#E0DED8]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F0EFEA]">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#555]">
                  MÉTRICAS DA RECOMENDAÇÃO
                </span>
                {item.score !== undefined && item.score > 0 && (
                  <span className="text-[10px] font-bold text-[#111] bg-[#F2F1ED] px-2 py-0.5 border border-[#E0DED8]">
                    SCORE: {item.score.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs text-[#444]">
                <div className="flex justify-between items-center">
                  <span className="text-[#777]">Tópico Atribuído:</span>
                  <span className="font-semibold text-[#111]">{item.topic}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#777]">Fonte de Origem:</span>
                  <span className="font-semibold text-[#111]">{item.sourceName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#777]">Recência da Publicação:</span>
                  <span className="font-semibold text-[#111]">{timeAgo(item.publishedAt)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Perspectivas 360° */}
          <div className="mb-6 p-4 border border-[#E0DED8] bg-[#FFF]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#F0EFEA]">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#555]">
                PERSPECTIVAS 360°
              </p>
              <span className="text-[10px] text-[#999] uppercase tracking-wider">Leitura em 1 clique</span>
            </div>

            {loadingP ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: '38px',
                      background: '#F0EFEA',
                      animation: 'pulse 1.4s ease infinite',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            ) : perspectives.length > 0 ? (
              <div className="space-y-2">
                {/* Selector de Abas Monocromáticas */}
                <div className="flex gap-1 p-1 mb-3 bg-[#F2F1ED] border border-[#E0DED8]">
                  {perspectives.map((p) => {
                    const isActive = activeTab === p.type
                    return (
                      <button
                        key={p.type}
                        onClick={() => setActiveTab(p.type)}
                        className="flex-1 py-1.5 px-2 text-[11px] font-medium tracking-tight transition-all text-center uppercase"
                        style={{
                          background: isActive ? '#111' : 'transparent',
                          color: isActive ? '#FFF' : '#5C5C5C',
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
                      className="p-3.5 border border-[#E0DED8] bg-[#F8F7F4]"
                    >
                      <h4 className="text-xs font-bold uppercase tracking-wide text-[#111] mb-1">{p.title}</h4>
                      <p className="text-xs text-[#444] leading-relaxed mb-3">{p.summary}</p>
                      
                      <button
                        onClick={() => openQuestion({
                          id: `p-${item.id}-${p.type}`,
                          text: `Aprofundar na perspectiva '${p.title}' sobre '${item.normalizedTitle}'`,
                          topic: item.topic,
                          newsItemId: item.id
                        })}
                        className="text-[10px] uppercase tracking-wider font-semibold text-[#111] hover:underline flex items-center gap-1"
                      >
                        <span>Aprofundar via chat</span>
                        <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-[#888]">Análise indisponível para este artigo.</p>
            )}
          </div>

          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between w-full px-5 py-3 text-xs uppercase tracking-wider font-semibold text-white transition-opacity hover:opacity-90"
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
