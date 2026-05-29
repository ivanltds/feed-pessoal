'use client'

import { useEffect, useState } from 'react'
import type { SuggestedQuestion } from '@/services/question-generator'
import { useDeepDive } from '@/hooks/useDeepDive'

interface NewsItem {
  id: string
  topic: string
  normalizedTitle: string
}

interface Props {
  userId: string
  topItem: NewsItem
}

export default function DoneScreen({ userId, topItem }: Props) {
  const [questions, setQuestions] = useState<SuggestedQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const { openQuestion } = useDeepDive(userId)

  useEffect(() => {
    fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newsItemId: topItem.id }),
    })
      .then((r) => r.json())
      .then((data) => setQuestions(data.questions ?? []))
      .finally(() => setLoading(false))
  }, [topItem.id])


  return (
    <div className="pb-20 text-center" style={{ animation: 'fadeUp 0.5s ease both' }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Linha divisória + mensagem */}
      <div className="mb-8 pt-8" style={{ borderTop: '1px solid #E0DED8' }}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#9E9E9E] mb-3">Você está em dia</p>
        <p className="text-sm text-[#5C5C5C]">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Perguntas para aprofundar */}
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#9E9E9E] mb-4 text-center">
          Quer se aprofundar?
        </p>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse"
                style={{ background: '#E8E7E3' }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => openQuestion(q)}
                className="w-full text-left px-4 py-3.5 text-sm text-[#111] transition-colors duration-150 hover:bg-[#F2F1ED]"
                style={{ border: '1px solid #E0DED8', background: '#FFF' }}
              >
                {q.text}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
