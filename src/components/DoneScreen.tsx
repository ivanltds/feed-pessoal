'use client'

import { useEffect, useState } from 'react'
import type { EditionBriefing } from '@/services/edition-briefing-generator'
import { useDeepDive } from '@/hooks/useDeepDive'

interface NewsItem {
  id: string
  editionId?: string
  topic: string
  normalizedTitle: string
}

interface Props {
  userId: string
  topItem: NewsItem
  editionId?: string
}

export default function DoneScreen({ userId, topItem, editionId }: Props) {
  const [briefing, setBriefing] = useState<EditionBriefing | null>(null)
  const [loading, setLoading] = useState(true)
  const { openQuestion } = useDeepDive(userId)

  const edId = editionId ?? topItem.editionId

  useEffect(() => {
    if (!edId) {
      setLoading(false)
      return
    }

    setLoading(true)
    fetch('/api/edition-briefing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editionId: edId }),
    })
      .then((r) => r.json())
      .then((data) => setBriefing(data))
      .catch(() => setBriefing(null))
      .finally(() => setLoading(false))
  }, [edId])

  return (
    <div className="pb-24 max-w-xl mx-auto text-left" style={{ animation: 'fadeUp 0.4s ease both' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Linha divisória + mensagem de conclusão */}
      <div className="pt-10 mb-8 border-t border-[#E0DED8] text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#777] mb-2 font-bold">
          VOCÊ ESTÁ EM DIA COM A EDIÇÃO
        </p>
        <p className="text-xs text-[#9E9E9E]">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Briefing Executivo em 3 Destaques */}
      <div className="bg-[#FFF] p-5 border border-[#E0DED8] mb-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E0DED8]">
          <h3 className="text-xs font-bold text-[#111] uppercase tracking-[0.18em]">
            RESUMO EXECUTIVO DA EDIÇÃO
          </h3>
          <span className="text-[10px] text-[#9E9E9E] uppercase tracking-wider">3 Destaques</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-[#F2F1ED] animate-pulse" />
            ))}
          </div>
        ) : briefing?.highlights && briefing.highlights.length > 0 ? (
          <ul className="space-y-3">
            {briefing.highlights.map((h, idx) => (
              <li key={idx} className="flex gap-3 text-xs text-[#333] leading-relaxed">
                <span className="shrink-0 text-[10px] font-bold text-[#111] bg-[#F2F1ED] w-5 h-5 flex items-center justify-center border border-[#E0DED8]">
                  {idx + 1}
                </span>
                <span>{h.replace(/[\u{1F300}-\u{1F9FF}]/gu, '')}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[#777]">Você conferiu todas as matérias da sua edição.</p>
        )}
      </div>

      {/* Pílulas de Aprofundamento */}
      {briefing?.suggestedPills && briefing.suggestedPills.length > 0 && (
        <div className="mb-6">
          <p className="text-[10px] font-bold text-[#777] uppercase tracking-[0.18em] mb-3">
            TÓPICOS DE APROFUNDAMENTO
          </p>

          <div className="flex flex-wrap gap-2">
            {briefing.suggestedPills.map((pill, i) => (
              <button
                key={i}
                onClick={() =>
                  openQuestion({
                    id: `pill-${i}`,
                    text: pill.question,
                    topic: topItem.topic,
                    newsItemId: topItem.id
                  })
                }
                className="px-3 py-2 text-xs font-medium bg-[#FFF] text-[#222] border border-[#E0DED8] hover:border-[#111] transition-all flex items-center gap-2 text-left"
              >
                <span>{pill.label.replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim()}</span>
                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="opacity-40">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
