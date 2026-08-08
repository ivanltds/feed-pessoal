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
      <div className="pt-10 mb-8 border-t border-[#E5E3DC] text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAE8E1] text-xs font-semibold text-[#444] mb-3">
          <span>✨</span>
          <span>VOCÊ ESTÁ 100% EM DIA</span>
        </div>
        <p className="text-xs text-[#777]">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Briefing Executivo em 3 Destaques */}
      <div className="bg-[#FFF] rounded-xl p-5 border border-[#E5E3DC] shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EFEA]">
          <h3 className="text-sm font-bold text-[#111] uppercase tracking-wider flex items-center gap-2">
            <span>📌</span> Resumo Executivo da Edição
          </h3>
          <span className="text-[11px] text-[#888]">3 Pontos Chave</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-[#F2F1ED] rounded animate-pulse" />
            ))}
          </div>
        ) : briefing?.highlights && briefing.highlights.length > 0 ? (
          <ul className="space-y-3">
            {briefing.highlights.map((h, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-[#333] leading-relaxed">
                <span className="shrink-0 w-5 h-5 rounded-full bg-[#F2F1ED] text-[#111] text-xs font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[#777]">Você conferiu todas as principais notícias do seu feed de hoje.</p>
        )}
      </div>

      {/* Pílulas de Aprofundamento */}
      {briefing?.suggestedPills && briefing.suggestedPills.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-bold text-[#777] uppercase tracking-wider mb-3">
            💡 Quer se aprofundar em algo?
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
                className="px-3.5 py-2.5 rounded-lg text-xs font-medium bg-[#FFF] text-[#222] border border-[#E0DED8] hover:border-[#111] hover:bg-[#F8F7F4] transition-all flex items-center gap-2 shadow-sm text-left"
              >
                <span>{pill.label}</span>
                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="opacity-50">
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
