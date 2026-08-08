'use client'

import { useEffect, useState } from 'react'
import type { WeeklyDigest } from '@/services/weekly-digest-generator'

interface Props {
  onClose: () => void
}

export default function WeeklyDigestModal({ onClose }: Props) {
  const [digest, setDigest] = useState<WeeklyDigest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/weekly-digest')
      .then((r) => r.json())
      .then((data) => setDigest(data))
      .catch(() => setDigest(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 9500, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#F8F7F4] rounded-xl overflow-hidden shadow-2xl border border-[#E0DED8] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE8E1] bg-[#FFF]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#777] block">
              🗓️ RETROSPECTIVA DOS FATOS
            </span>
            <h3 className="text-lg font-bold text-[#111]">
              Resumo Inteligente da Semana {digest?.dateRange ? `(${digest.dateRange})` : ''}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#888] hover:text-[#111]">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="space-y-4 py-8 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#111] border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-sm text-[#777]">Sintetizando os principais fatos dos últimos 7 dias…</p>
            </div>
          ) : digest ? (
            <>
              {/* Summary box */}
              <div className="p-4 rounded-lg bg-[#FFF] border border-[#E5E3DC] shadow-sm">
                <p className="text-sm text-[#333] leading-relaxed italic">
                  "{digest.summary}"
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-4">
                {digest.highlights.map((h, idx) => (
                  <div key={idx} className="p-5 rounded-lg bg-[#FFF] border border-[#E5E3DC]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#EAE8E1] text-[#444]">
                        {h.topic}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#111] mb-3">{h.title}</h4>

                    {/* Timeline */}
                    {h.timeline && h.timeline.length > 0 && (
                      <div className="relative pl-4 mb-4 border-l-2 border-[#111] space-y-2">
                        {h.timeline.map((step, i) => (
                          <div key={i} className="text-xs">
                            <span className="font-semibold text-[#111]">{step.date}: </span>
                            <span className="text-[#555]">{step.fact}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-3 rounded bg-[#F8F7F4] border border-[#EAE8E1] text-xs text-[#333]">
                      <strong>Conclusão:</strong> {h.keyTakeaway}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-[#777] text-center">Não foi possível carregar a retrospectiva semanal.</p>
          )}
        </div>
      </div>
    </div>
  )
}
