import type { RawNewsItem, NewsItem } from '@/domain/news/types'

export interface TopicWeights {
  [topic: string]: number
}

const DEFAULT_WEIGHT = 1.0
const MAX_TOTAL = 30        // máximo total de itens na edição

/**
 * Calcula o score de um item baseado em:
 * - peso do tópico do usuário
 * - recência (decai com o tempo)
 * - qualidade da fonte (stub: todas valem 1.0 por enquanto)
 */
function calcScore(item: RawNewsItem, topicWeights: TopicWeights): number {
  const topicWeight = topicWeights[item.topic] ?? DEFAULT_WEIGHT

  // recência: 1.0 = agora, decai linearmente em 48h
  const ageHours = (Date.now() - item.publishedAt.getTime()) / (1000 * 60 * 60)
  const recencyScore = Math.max(0, 1 - ageHours / 48)

  // qualidade da fonte (expansível — por ora todas iguais)
  const sourceQuality = 1.0

  return topicWeight * recencyScore * sourceQuality
}

/**
 * Seleciona até 30 itens distribuídos proporcionalmente pelos tópicos ativos.
 * 1 tópico → 30 itens; 2 tópicos → 15 cada; 6 tópicos → 5 cada.
 */
export function rankItems(
  candidates: RawNewsItem[],
  topicWeights: TopicWeights
): NewsItem[] {
  // pontua todos os candidatos
  const scored = candidates.map((item) => ({
    ...item,
    normalizedTitle: item.title,
    score: calcScore(item, topicWeights),
  }))

  // deduplica por URL
  const seen = new Set<string>()
  const unique = scored.filter((item) => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })

  // agrupa por tópico
  const byTopic = new Map<string, typeof unique>()
  for (const item of unique) {
    const group = byTopic.get(item.topic) ?? []
    group.push(item)
    byTopic.set(item.topic, group)
  }

  // calcula cota por tópico dinamicamente: 30 ÷ número de tópicos presentes
  const numTopics = Math.max(1, byTopic.size)
  const itemsPerTopic = Math.ceil(MAX_TOTAL / numTopics)

  for (const [topic, items] of byTopic) {
    byTopic.set(topic, items.sort((a, b) => b.score - a.score).slice(0, itemsPerTopic))
  }

  // ordena os tópicos pelo score do seu melhor item
  const topicsByScore = [...byTopic.entries()].sort(
    (a, b) => (b[1][0]?.score ?? 0) - (a[1][0]?.score ?? 0)
  )

  // monta lista final: tópico por tópico, respeitando MAX_TOTAL
  const result: NewsItem[] = []
  for (const [, items] of topicsByScore) {
    for (const item of items) {
      if (result.length >= MAX_TOTAL) break
      result.push(item)
    }
    if (result.length >= MAX_TOTAL) break
  }

  return result
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
