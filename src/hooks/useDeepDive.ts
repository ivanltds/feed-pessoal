'use client'

import { useRouter } from 'next/navigation'
import type { SuggestedQuestion } from '@/services/question-generator'

/**
 * Hook compartilhado para navegar ao chat de aprofundamento.
 * Usado pelo NewsModal e pelo DoneScreen — ponto único de manutenção.
 */
export function useDeepDive(userId?: string) {
  const router = useRouter()

  const openQuestion = async (question: SuggestedQuestion) => {
    // Registra feedback se userId disponível (aprendizado de ranker)
    if (userId) {
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          events: [{ newsItemId: question.newsItemId, topic: question.topic, type: 'deep_dive_question' }],
        }),
      }).catch(() => {}) // fire-and-forget
    }

    const params = new URLSearchParams({
      q: question.text,
      topic: question.topic,
      itemId: question.newsItemId,
    })
    router.push(`/deep?${params.toString()}`)
  }

  return { openQuestion }
}
