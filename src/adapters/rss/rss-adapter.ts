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

const BLACKLISTED_IMAGE_PATTERNS = [
  'ebc_logo',
  'marca_agencia',
  'agencia_brasil',
  'agenciabrasil',
  'default_avatar',
  'default-thumbnail',
  'placeholder',
  'favicon',
  'logo-share',
  'site-logo',
  '1x1.gif',
  'blank.png',
  'gravatar.com',
  'icon-rss',
]

function isValidNewsImage(url?: string): boolean {
  if (!url) return false
  const lowerUrl = url.toLowerCase()
  return !BLACKLISTED_IMAGE_PATTERNS.some((pattern) => lowerUrl.includes(pattern))
}

function extractImage(item: Parser.Item & Record<string, unknown>): string | undefined {
  const mediaContent = item['media:content'] as { $?: { url?: string } } | undefined
  const mediaThumbnail = item['media:thumbnail'] as { $?: { url?: string } } | undefined
  const enclosure = item['enclosure'] as { url?: string; type?: string } | undefined

  let candidate: string | undefined

  if (mediaContent?.['$']?.url) candidate = mediaContent['$'].url
  else if (mediaThumbnail?.['$']?.url) candidate = mediaThumbnail['$'].url
  else if (enclosure?.url && enclosure?.type?.startsWith('image/')) candidate = enclosure.url
  else {
    // tenta extrair imagem do content HTML
    const content = (item.content ?? item['content:encoded'] ?? '') as string
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i)
    if (imgMatch) candidate = imgMatch[1]
  }

  return isValidNewsImage(candidate) ? candidate : undefined
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
