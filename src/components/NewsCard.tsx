'use client'

import { useState } from 'react'
import NewsModal from './NewsModal'

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
  variant?: 'hero' | 'secondary' | 'tile' | 'compact'
}

function timeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function Img({ src, aspect, className }: { src: string; aspect: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <div className={`w-full overflow-hidden bg-[#E3E2DC] ${aspect}`}>
      <img
        src={src}
        alt=""
        onError={() => setFailed(true)}
        className={className ?? 'w-full h-full object-cover'}
      />
    </div>
  )
}

function CompactImg({ src }: { src: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null
  return (
    <div className="w-[68px] h-[68px] shrink-0 overflow-hidden bg-[#E3E2DC]">
      <img src={src} alt="" onError={() => setFailed(true)} className="w-full h-full object-cover" />
    </div>
  )
}

export default function NewsCard({ item, variant = 'compact' }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const ago = timeAgo(item.publishedAt)

  const open = (e: React.MouseEvent) => {
    e.preventDefault()
    setModalOpen(true)
  }

  // ── Hero ──────────────────────────────────────────────────────────────────
  if (variant === 'hero') {
    return (
      <>
        <button onClick={open} className="group block w-full text-left">
          {item.imageUrl && (
            <div className="mb-4">
              <Img
                src={item.imageUrl}
                aspect="aspect-[16/9]"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
          )}
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#9E9E9E] mb-2.5">{item.topic}</p>
          <h2 className="text-2xl sm:text-3xl font-bold leading-[1.2] text-[#111] group-hover:opacity-60 transition-opacity duration-200 mb-3">
            {item.normalizedTitle}
          </h2>
          {item.summary && (
            <p className="text-sm text-[#5C5C5C] leading-relaxed mb-3">{item.summary}</p>
          )}
          <p className="text-xs text-[#9E9E9E]">{item.sourceName}&ensp;·&ensp;{ago}</p>
        </button>
        {modalOpen && <NewsModal item={item} onClose={() => setModalOpen(false)} />}
      </>
    )
  }

  // ── Secondary ─────────────────────────────────────────────────────────────
  if (variant === 'secondary') {
    return (
      <>
        <button onClick={open} className="group block w-full text-left">
          {item.imageUrl && (
            <div className="mb-3">
              <Img
                src={item.imageUrl}
                aspect="aspect-[3/2]"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
          )}
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#9E9E9E] mb-2">{item.topic}</p>
          <h2 className="text-base font-semibold leading-snug text-[#111] group-hover:opacity-60 transition-opacity duration-200 mb-2">
            {item.normalizedTitle}
          </h2>
          {item.summary && (
            <p className="text-xs text-[#5C5C5C] leading-relaxed mb-2 line-clamp-2">{item.summary}</p>
          )}
          <p className="text-xs text-[#9E9E9E]">{item.sourceName}&ensp;·&ensp;{ago}</p>
        </button>
        {modalOpen && <NewsModal item={item} onClose={() => setModalOpen(false)} />}
      </>
    )
  }

  // ── Tile ──────────────────────────────────────────────────────────────────
  if (variant === 'tile') {
    return (
      <>
        <button onClick={open} className="group block w-full text-left">
          {item.imageUrl && (
            <div className="mb-3">
              <Img
                src={item.imageUrl}
                aspect="aspect-[4/3]"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
          )}
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#9E9E9E] mb-1.5">{item.topic}</p>
          <h2 className="text-sm font-semibold leading-snug text-[#111] group-hover:opacity-60 transition-opacity duration-200 mb-1.5">
            {item.normalizedTitle}
          </h2>
          <p className="text-xs text-[#9E9E9E]">{item.sourceName}&ensp;·&ensp;{ago}</p>
        </button>
        {modalOpen && <NewsModal item={item} onClose={() => setModalOpen(false)} />}
      </>
    )
  }

  // ── Compact ────────────────────────────────────────────────────────────────
  return (
    <>
      <button onClick={open} className="group flex items-start gap-4 py-4 w-full text-left">
        {item.imageUrl && <CompactImg src={item.imageUrl} />}
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold leading-snug text-[#111] group-hover:opacity-60 transition-opacity duration-200 line-clamp-2 mb-1">
            {item.normalizedTitle}
          </h2>
          {item.summary && (
            <p className="text-xs text-[#5C5C5C] leading-relaxed line-clamp-2 mb-1.5">{item.summary}</p>
          )}
          <p className="text-xs text-[#9E9E9E]">{item.sourceName}&ensp;·&ensp;{ago}</p>
        </div>
      </button>
      {modalOpen && <NewsModal item={item} onClose={() => setModalOpen(false)} />}
    </>
  )
}
