import type { RawNewsItem, NewsItem } from '@/domain/news/types'

export interface TopicWeights {
  [topic: string]: number
}

const DEFAULT_WEIGHT = 1.0
const EDITION_SIZE = 7
const MIN_TOPICS_IN_EDITION = 2

/**
 * Calcula o score de um item baseado em:
 * - peso do tópico do usuário
 * - recência (decai com o tempo)
 * - qualidade da fonte (stub: todas valem 1.0 por enquanto)
 */
function calcScore(item: RawNewsItem, topicWeights: TopicWeights): number {
  const topicWeight = topicWeights[item.topic] ?? DEFAULT_WEIGHT

  // recência: 1.0 = agora, decai linearmente em 24h
  const ageHours = (Date.now() - item.publishedAt.getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(0, 1 - ageHours / 48) // zera em 48h

  // qualidade da fonte (expansível — por ora todas iguais)
  const sourceQuality = 1.0

  return topicWeight * recencyScore * sourceQuality
}

/**
 * Seleciona os 7 melhores itens garantindo diversidade mínima de tópicos.
 */
export function rankItems(
  candidates: RawNewsItem[],
  topicWeights: TopicWeights
): NewsItem[] {
  // pontua todos os candidatos
  const scored = candidates.map((item) => ({
    ...item,
    normalizedTitle: item.title, // preenchido após normalização
    score: calcScore(item, topicWeights),
  }))

  // ordena por score decrescente
  scored.sort((a, b) => b.score - a.score)

  const selected: NewsItem[] = []
  const topicsUsed = new Set<string>()

  // primeira passagem: pega os melhores garantindo diversidade mínima
  for (const item of scored) {
    if (selected.length >= EDITION_SIZE) break
    if (selected.length >= EDITION_SIZE - MIN_TOPICS_IN_EDITION || !topicsUsed.has(item.topic)) {
      selected.push(item)
      topicsUsed.add(item.topic)
    }
  }

  // segunda passagem: completa se faltou (caso haja poucos tópicos)
  if (selected.length < EDITION_SIZE) {
    for (const item of scored) {
      if (selected.length >= EDITION_SIZE) break
      if (!selected.includes(item)) selected.push(item)
    }
  }

  return selected.slice(0, EDITION_SIZE)
}

/**
 * Calcula novos pesos a partir dos eventos de feedback de uma sessão.
 */
export function applyFeedbackDeltas(
  currentWeights: TopicWeights,
  events: { topic: string; type: 'deep_dive_question' | 'long_read' | 'skip' }[]
): TopicWeights {
  const DELTAS = {
    deep_dive_question: 2.0,
    long_read: 1.0,
    skip: -0.5,
  }

  const updated = { ...currentWeights }

  for (const event of events) {
    const current = updated[event.topic] ?? DEFAULT_WEIGHT
    const delta = DELTAS[event.type]
    // mantém peso entre 0.1 e 10 para evitar extremos
    updated[event.topic] = Math.min(10, Math.max(0.1, current + delta))
  }

  return updated
}
