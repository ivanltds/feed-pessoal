'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { SuggestedQuestion } from '@/services/question-generator'

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
  const router = useRouter()

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

  const handleQuestion = async (question: SuggestedQuestion) => {
    // registra feedback de deep_dive_question
    await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        events: [{ newsItemId: question.newsItemId, topic: question.topic, type: 'deep_dive_question' }],
      }),
    })

    // navega para o modo 2 com a pergunta codificada
    const params = new URLSearchParams({
      q: question.text,
      topic: question.topic,
      itemId: question.newsItemId,
    })
    router.push(`/deep?${params.toString()}`)
  }

  return (
    <div className="mt-10 pb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Ícone de conclusão */}
      <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-neutral-800 mb-1">Você está em dia</h2>
      <p className="text-sm text-neutral-400 mb-8">
        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
      </p>

      {/* Perguntas sugeridas */}
      <div className="text-left">
        <p className="text-xs text-neutral-400 uppercase tracking-widest mb-3 text-center">
          Quer se aprofundar?
        </p>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-14 rounded-2xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => handleQuestion(q)}
                className="w-full text-left px-4 py-3.5 rounded-2xl bg-white border border-neutral-200 text-sm font-medium text-neutral-800 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-150 shadow-sm"
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
