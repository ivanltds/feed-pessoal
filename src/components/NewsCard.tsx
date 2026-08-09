'use client'

import { useState, useEffect, useRef } from 'react'
import NewsModal from './NewsModal'
import { getCategoryFallbackPhoto } from '@/lib/category-photos'

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
  region?: string
}

interface Props {
  item: NewsItem
  variant?: 'hero' | 'secondary' | 'tile' | 'compact'
}

function timeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function formatRegion(region?: string): string {
  if (region === 'ORIENTE_MEDIO') return 'ORIENTE MÉDIO'
  if (region === 'ASIA_PACIFICO') return 'ÁSIA-PACÍFICO'
  if (region === 'SUL_GLOBAL') return 'SUL GLOBAL'
  return 'OCIDENTAL'
}

function useImgStatus(src: string) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading')
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.complete) {
      setStatus(el.naturalWidth > 0 ? 'loaded' : 'failed')
    }
  }, [src])

  return { ref, status, setStatus }
}

function Img({ src, fallbackSrc, aspect, className }: { src: string; fallbackSrc: string; aspect: string; className?: string }) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const { ref, status, setStatus } = useImgStatus(currentSrc)

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setStatus('loading')
    } else {
      setStatus('failed')
    }
  }

  return (
    <div className={`w-full overflow-hidden bg-[#E3E2DC] ${aspect}`}>
      <img
        ref={ref}
        src={currentSrc}
        alt=""
        onLoad={() => setStatus('loaded')}
        onError={handleError}
        className={`${className ?? 'w-full h-full object-cover'} transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

function TileImg({ src, fallbackSrc }: { src: string; fallbackSrc: string }) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const { ref, status, setStatus } = useImgStatus(currentSrc)

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setStatus('loading')
    } else {
      setStatus('failed')
    }
  }

  return (
    <img
      ref={ref}
      src={currentSrc}
      alt=""
      onLoad={() => setStatus('loaded')}
      onError={handleError}
      className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.02] ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
    />
  )
}

function CompactImg({ src, fallbackSrc }: { src: string; fallbackSrc: string }) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const { ref, status, setStatus } = useImgStatus(currentSrc)

  const handleError = () => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setStatus('loading')
    } else {
      setStatus('failed')
    }
  }

  return (
    <div className="w-[68px] h-[68px] shrink-0 overflow-hidden bg-[#E3E2DC]">
      <img
        ref={ref}
        src={currentSrc}
        alt=""
        onLoad={() => setStatus('loaded')}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

export default function NewsCard({ item, variant = 'compact' }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const ago = timeAgo(item.publishedAt)
  const regionTag = formatRegion(item.region)
  const fallbackPhoto = getCategoryFallbackPhoto(item.topic)
  const effectiveImageUrl = item.imageUrl || fallbackPhoto

  const open = (e: React.MouseEvent) => {
    e.preventDefault()
    setModalOpen(true)
  }

  // Hero: Garantia de foto 100% visível
  if (variant === 'hero') {
    return (
      <>
        <button onClick={open} className="group block w-full text-left">
          <div className="mb-4">
            <Img
              src={effectiveImageUrl}
              fallbackSrc={fallbackPhoto}
              aspect="aspect-[16/9]"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
          </div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#9E9E9E] mb-2.5 font-bold">{item.topic}</p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-[1.2] text-[#111] group-hover:opacity-60 transition-opacity duration-200 mb-3">
            {item.normalizedTitle}
          </h2>
          {item.summary && (
            <p className="text-sm text-[#5C5C5C] leading-relaxed mb-3">{item.summary}</p>
          )}
          <p className="text-xs text-[#9E9E9E]">{item.sourceName}&ensp;·&ensp;{regionTag}&ensp;·&ensp;{ago}</p>
        </button>
        {modalOpen && <NewsModal item={item} onClose={() => setModalOpen(false)} />}
      </>
    )
  }

  // Secondary
  if (variant === 'secondary') {
    return (
      <>
        <button onClick={open} className="group block w-full text-left">
          <div className="mb-3 aspect-[3/2] w-full overflow-hidden" style={{ background: '#E3E2DC' }}>
            <TileImg src={effectiveImageUrl} fallbackSrc={fallbackPhoto} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#9E9E9E] mb-2 font-bold">{item.topic}</p>
          <h2 className="text-base font-semibold leading-snug text-[#111] group-hover:opacity-60 transition-opacity duration-200 mb-2">
            {item.normalizedTitle}
          </h2>
          {item.summary && (
            <p className="text-xs text-[#5C5C5C] leading-relaxed mb-2 line-clamp-2">{item.summary}</p>
          )}
          <p className="text-xs text-[#9E9E9E]">{item.sourceName}&ensp;·&ensp;{regionTag}&ensp;·&ensp;{ago}</p>
        </button>
        {modalOpen && <NewsModal item={item} onClose={() => setModalOpen(false)} />}
      </>
    )
  }

  // Tile
  if (variant === 'tile') {
    return (
      <>
        <button onClick={open} className="group block w-full text-left">
          <div className="mb-3 aspect-[4/3] w-full overflow-hidden" style={{ background: '#E3E2DC' }}>
            <TileImg src={effectiveImageUrl} fallbackSrc={fallbackPhoto} />
          </div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#9E9E9E] mb-1.5 font-bold">{item.topic}</p>
          <h2 className="text-sm font-semibold leading-snug text-[#111] group-hover:opacity-60 transition-opacity duration-200 mb-1.5">
            {item.normalizedTitle}
          </h2>
          <p className="text-xs text-[#9E9E9E]">{item.sourceName}&ensp;·&ensp;{regionTag}&ensp;·&ensp;{ago}</p>
        </button>
        {modalOpen && <NewsModal item={item} onClose={() => setModalOpen(false)} />}
      </>
    )
  }

  // Compact
  return (
    <>
      <button onClick={open} className="group flex items-start gap-4 py-4 w-full text-left">
        <CompactImg src={effectiveImageUrl} fallbackSrc={fallbackPhoto} />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold leading-snug text-[#111] group-hover:opacity-60 transition-opacity duration-200 line-clamp-2 mb-1">
            {item.normalizedTitle}
          </h2>
          {item.summary && (
            <p className="text-xs text-[#5C5C5C] leading-relaxed line-clamp-2 mb-1.5">{item.summary}</p>
          )}
          <p className="text-xs text-[#9E9E9E]">{item.sourceName}&ensp;·&ensp;{regionTag}&ensp;·&ensp;{ago}</p>
        </div>
      </button>
      {modalOpen && <NewsModal item={item} onClose={() => setModalOpen(false)} />}
    </>
  )
}
