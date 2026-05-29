import Parser from 'rss-parser'
import type { RawNewsItem, Topic } from '@/domain/news/types'

const parser = new Parser({
  customFields: {
    item: ['media:content', 'media:thumbnail', 'enclosure'],
  },
})

export interface RssSource {
  id: string
  name: string
  url: string
  topic: Topic
}

function extractImage(item: Parser.Item & Record<string, unknown>): string | undefined {
  const mediaContent = item['media:content'] as { $?: { url?: string } } | undefined
  const mediaThumbnail = item['media:thumbnail'] as { $?: { url?: string } } | undefined
  const enclosure = item['enclosure'] as { url?: string; type?: string } | undefined

  if (mediaContent?.['$']?.url) return mediaContent['$'].url
  if (mediaThumbnail?.['$']?.url) return mediaThumbnail['$'].url
  if (enclosure?.url && enclosure?.type?.startsWith('image/')) return enclosure.url

  // tenta extrair imagem do content HTML
  const content = (item.content ?? item['content:encoded'] ?? '') as string
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (imgMatch) return imgMatch[1]

  return undefined
}

export async function fetchFromRss(source: RssSource): Promise<RawNewsItem[]> {
  try {
    // Timeout de 5s por feed para não travar no caso de fonte lenta
    const feedPromise = parser.parseURL(source.url)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 5000)
    )
    const feed = await Promise.race([feedPromise, timeoutPromise])
    return feed.items.slice(0, 20).map((item) => ({
      sourceId: source.id,
      sourceName: source.name,
      topic: source.topic,
      title: item.title ?? 'Sem título',
      url: item.link ?? '',
      imageUrl: extractImage(item as unknown as Parser.Item & Record<string, unknown>),
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      summary: item.contentSnippet?.slice(0, 300),
    }))
  } catch (error) {
    console.error(`[RSS] Erro ao buscar ${source.name}:`, error)
    return []
  }
}
