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
      style={{ zIndex: 9500, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-[#F8F7F4] border border-[#E0DED8] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE8E1] bg-[#FFF]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#777] block mb-0.5">
              RETROSPECTIVA DOS FATOS & RADAR GLOBAL
            </span>
            <h3 className="text-base font-bold text-[#111]">
              Resumo Semanal {digest?.dateRange ? `(${digest.dateRange})` : ''}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#888] hover:text-[#111]">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="space-y-4 py-8 text-center">
              <div className="w-5 h-5 rounded-full border-2 border-[#111] border-t-transparent animate-spin mx-auto mb-3" />
              <p className="text-xs text-[#777] uppercase tracking-wider">Sintetizando fatos dos últimos 7 dias...</p>
            </div>
          ) : digest ? (
            <>
              {/* Summary box */}
              <div className="p-4 bg-[#FFF] border border-[#E0DED8]">
                <p className="text-xs text-[#333] leading-relaxed italic">
                  "{digest.summary.replace(/[\u{1F300}-\u{1F9FF}]/gu, '')}"
                </p>
              </div>

              {/* Radar de Perspectivas Globais */}
              <div className="p-4 bg-[#FFF] border border-[#111]">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#111] block mb-2">
                  RADAR DE PERSPECTIVAS GLOBAIS (SUL GLOBAL & ÁSIA)
                </span>
                <p className="text-xs text-[#444] leading-relaxed">
                  Os boletins dos últimos 7 dias integraram coberturas diretas de veículos internacionais não-ocidentais (incluindo <em>Al Jazeera</em>, <em>SCMP</em>, <em>Nikkei Asia</em> e <em>Inter Press Service</em>), contrabalançando a pauta ocidental com a visão dos mercados emergentes.
                </p>
              </div>

              {/* Highlights */}
              <div className="space-y-4">
                {digest.highlights.map((h, idx) => (
                  <div key={idx} className="p-5 bg-[#FFF] border border-[#E0DED8]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold tracking-[0.18em] px-2 py-0.5 bg-[#F2F1ED] text-[#444] border border-[#E0DED8]">
                        {h.topic}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#111] mb-3">{h.title.replace(/[\u{1F300}-\u{1F9FF}]/gu, '')}</h4>

                    {/* Timeline */}
                    {h.timeline && h.timeline.length > 0 && (
                      <div className="relative pl-3 mb-4 border-l border-[#111] space-y-2">
                        {h.timeline.map((step, i) => (
                          <div key={i} className="text-xs">
                            <span className="font-semibold text-[#111]">{step.date}: </span>
                            <span className="text-[#555]">{step.fact}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="p-3 bg-[#F8F7F4] border border-[#E0DED8] text-xs text-[#333]">
                      <strong>Conclusão:</strong> {h.keyTakeaway}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-[#777] text-center">Retrospectiva semanal indisponível.</p>
          )}
        </div>
      </div>
    </div>
  )
}
