import { prisma } from '@/lib/prisma'
import { fetchFromRss } from '@/adapters/rss/rss-adapter'
import { getSourcesByTopics } from '@/adapters/sources'
import { normalizeTitles } from './title-normalizer'
import { rankItems, type TopicWeights } from './ranker'
import type { RawNewsItem } from '@/domain/news/types'

export async function buildEditionForUser(userId: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  // verifica se já existe edição de hoje
  const existing = await prisma.edition.findUnique({
    where: { userId_date: { userId, date: today } },
  })
  if (existing) {
    console.log(`[EditionBuilder] Edição de ${today} já existe para ${userId}`)
    return
  }

  // busca pesos de tópico do usuário
  const weights = await prisma.userTopicWeight.findMany({ where: { userId } })
  const topicWeights: TopicWeights = {}
  weights.forEach((w) => { topicWeights[w.topic] = w.weight })

  // descobre tópicos com peso > 0
  const activeTopics = Object.entries(topicWeights)
    .filter(([, w]) => w > 0)
    .map(([topic]) => topic)

  if (activeTopics.length === 0) {
    console.warn(`[EditionBuilder] Usuário ${userId} sem tópicos configurados`)
    return
  }

  // busca notícias de todas as fontes ativas dos tópicos do usuário
  const sources = getSourcesByTopics(activeTopics)
  const rawItems: RawNewsItem[] = (
    await Promise.all(sources.map(fetchFromRss))
  ).flat()

  if (rawItems.length === 0) {
    console.error('[EditionBuilder] Nenhum item encontrado nas fontes')
    return
  }

  // rankeia e seleciona 7 itens
  const rankedItems = rankItems(rawItems, topicWeights)

  // normaliza títulos em batch
  const originalTitles = rankedItems.map((i) => i.title)
  const normalizedTitles = await normalizeTitles(originalTitles)

  // persiste a edição
  const edition = await prisma.edition.create({
    data: {
      userId,
      date: today,
      items: {
        create: rankedItems.map((item, idx) => ({
          topic: item.topic,
          sourceId: item.sourceId,
          sourceName: item.sourceName,
          originalTitle: item.title,
          normalizedTitle: normalizedTitles[idx],
          imageUrl: item.imageUrl,
          url: item.url,
          publishedAt: item.publishedAt,
          score: item.score,
          position: idx + 1,
        })),
      },
    },
  })

  console.log(`[EditionBuilder] Edição ${edition.id} criada para ${userId} com ${rankedItems.length} itens`)
}

export async function getTodaysEdition(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  return prisma.edition.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { items: { orderBy: { position: 'asc' } } },
  })
}
