export const TOPICS = [
  'Tecnologia',
  'Economia',
  'Geopolítica',
  'Ciência',
  'Brasil',
  'Mundo',
  'Cultura',
  'Esportes',
] as const

export type Topic = typeof TOPICS[number]

export interface RawNewsItem {
  sourceId: string
  sourceName: string
  topic: Topic
  title: string
  url: string
  imageUrl?: string
  publishedAt: Date
  summary?: string
}

export interface NewsItem extends RawNewsItem {
  normalizedTitle: string
  score: number
}
