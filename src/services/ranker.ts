import type { RawNewsItem, NewsItem } from '@/domain/news/types'

export interface TopicWeights {
  [topic: string]: number
}

const DEFAULT_WEIGHT = 1.0
const MAX_TOTAL = 30
const MAX_PER_SOURCE = 3   // evita domínio de uma única fonte

/**
 * Decaimento exponencial de recência.
 * Meia-vida de 8h: item de 8h atrás vale 0.5, 16h vale 0.25, 24h vale 0.125.
 * Items com menos de 2h valem praticamente 1.0.
 */
function recencyScore(publishedAt: Date): number {
  const ageHours = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60)
  return Math.exp(-ageHours / 12)  // λ = 1/12, ~natural para notícias
}

function calcScore(item: RawNewsItem, topicWeights: TopicWeights): number {
  const topicWeight = topicWeights[item.topic] ?? DEFAULT_WEIGHT
  const sourceQuality = 1.0  // expansível por fonte
  return topicWeight * recencyScore(item.publishedAt) * sourceQuality
}

/**
 * Distribui as 30 vagas proporcionalmente ao peso de cada tópico.
 * Tópico com peso 8 recebe ~2× mais itens que tópico com peso 4.
 * Mínimo de 2 itens por tópico garantido.
 */
function proportionalQuotas(
  topics: string[],
  weights: TopicWeights,
  total: number
): Map<string, number> {
  const MIN_PER_TOPIC = 2
  const weightSum = topics.reduce((s, t) => s + (weights[t] ?? DEFAULT_WEIGHT), 0)

  const quotas = new Map<string, number>()
  let allocated = 0

  for (const topic of topics) {
    const w = weights[topic] ?? DEFAULT_WEIGHT
    const raw = Math.round((w / weightSum) * total)
    const quota = Math.max(MIN_PER_TOPIC, raw)
    quotas.set(topic, quota)
    allocated += quota
  }

  // ajusta se ultrapassou MAX_TOTAL (reduz dos tópicos com menor peso)
  const sorted = [...topics].sort((a, b) => (weights[a] ?? 1) - (weights[b] ?? 1))
  let excess = allocated - total
  for (const topic of sorted) {
    if (excess <= 0) break
    const current = quotas.get(topic)!
    const canReduce = Math.min(excess, current - MIN_PER_TOPIC)
    if (canReduce > 0) {
      quotas.set(topic, current - canReduce)
      excess -= canReduce
    }
  }

  return quotas
}

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

  // agrupa por tópico e ordena por score
  const byTopic = new Map<string, typeof unique>()
  for (const item of unique) {
    const group = byTopic.get(item.topic) ?? []
    group.push(item)
    byTopic.set(item.topic, group)
  }

  const topics = [...byTopic.keys()]
  const quotas = proportionalQuotas(topics, topicWeights, MAX_TOTAL)

  // seleciona itens por tópico: top-N por score, com cap por fonte
  for (const [topic, items] of byTopic) {
    const quota = quotas.get(topic) ?? MIN_PER_TOPIC_FALLBACK
    const perSource = new Map<string, number>()
    const selected: typeof items = []

    for (const item of items.sort((a, b) => b.score - a.score)) {
      if (selected.length >= quota) break
      const sourceCount = perSource.get(item.sourceId) ?? 0
      if (sourceCount >= MAX_PER_SOURCE) continue
      selected.push(item)
      perSource.set(item.sourceId, sourceCount + 1)
    }

    byTopic.set(topic, selected)
  }

  // ordena tópicos pelo score do melhor item (maior interesse primeiro)
  const topicsByScore = [...byTopic.entries()].sort(
    (a, b) => (b[1][0]?.score ?? 0) - (a[1][0]?.score ?? 0)
  )

  // monta lista final
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

const MIN_PER_TOPIC_FALLBACK = 2

/**
 * Calcula novos pesos a partir dos eventos de feedback de uma sessão.
 * deep_dive_question = maior interesse (conversa com IA)
 * long_read = leu o artigo original (interesse alto)
 * skip = pulou rápido (desinteresse)
 */
export function applyFeedbackDeltas(
  currentWeights: TopicWeights,
  events: { topic: string; type: 'deep_dive_question' | 'long_read' | 'skip' }[]
): TopicWeights {
  const DELTAS: Record<string, number> = {
    deep_dive_question: 2.5,   // IA = sinal mais forte de interesse
    long_read: 1.5,            // leu o original = interesse real
    skip: -0.5,
  }

  const updated = { ...currentWeights }

  for (const event of events) {
    const current = updated[event.topic] ?? DEFAULT_WEIGHT
    const delta = DELTAS[event.type] ?? 0
    updated[event.topic] = Math.min(10, Math.max(0.1, current + delta))
  }

  return updated
}
