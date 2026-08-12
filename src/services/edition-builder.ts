import { prisma } from '@/lib/prisma'
import { fetchFromRss } from '@/adapters/rss/rss-adapter'
import { getSourcesByTopics } from '@/adapters/sources'
import { normalizeTitles, isProbablyEnglish, translateSingleTitle } from './title-normalizer'
import { generateSummaries } from './summary-generator'
import { classifyNewsItems } from './topic-classifier'
import { rankItems, type TopicWeights } from './ranker'
import type { RawNewsItem } from '@/domain/news/types'
import { getCategoryFallbackPhoto } from '@/lib/category-photos'
import { sendPushNotificationToUser } from '@/lib/push-sender'

export type BuildResult = 'success' | 'already_exists' | 'no_topics' | 'no_items'

export async function buildEditionForUser(userId: string): Promise<BuildResult> {
  const today = new Date().toISOString().split('T')[0]

  // verifica se já existe edição de hoje
  const existing = await prisma.edition.findUnique({
    where: { userId_date: { userId, date: today } },
  })
  if (existing) {
    console.log(`[EditionBuilder] Edição de ${today} já existe para ${userId}`)
    return 'already_exists'
  }

  // busca usuário com preferências e pesos de tópicos
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      topicWeights: true,
    },
  })

  if (!user) {
    console.log(`[EditionBuilder] Usuário ${userId} não encontrado`)
    return 'no_topics'
  }



  const userWeights = user.topicWeights ?? []
  const selectedTopics = userWeights
    .filter((w) => w.weight >= 2.0)
    .map((w) => w.topic)

  const topics = selectedTopics.length > 0
    ? selectedTopics
    : userWeights.map((w) => w.topic)

  if (topics.length === 0) {
    console.log(`[EditionBuilder] Usuário ${userId} sem tópicos configurados`)
    return 'no_topics'
  }

  const language = user.language ?? 'pt-BR'

  // busca fontes dos tópicos do usuário
  const sources = getSourcesByTopics(topics)

  // coleta notícias de todas as fontes RSS simultaneamente
  const rawItemsList = await Promise.all(
    sources.map((s) => fetchFromRss(s))
  )
  let allRawItems: RawNewsItem[] = rawItemsList.flat()

  // Filtro Rígido de Recência de 48 Horas
  const cutoffTime = Date.now() - 48 * 60 * 60 * 1000
  allRawItems = allRawItems.filter((i) => new Date(i.publishedAt).getTime() >= cutoffTime)

  if (allRawItems.length === 0) {
    console.log(`[EditionBuilder] Nenhuma notícia coletada para os tópicos de ${userId}`)
    return 'no_items'
  }

  // Agente de IA para Validação e Classificação de Tópicos
  const classifiedItems = await classifyNewsItems(allRawItems, topics)

  if (classifiedItems.length === 0) {
    console.log(`[EditionBuilder] Nenhuma notícia válida após classificação por IA para ${userId}`)
    return 'no_items'
  }

  // constrói mapa de pesos do usuário
  const weightsMap: TopicWeights = {}
  for (const w of user.topicWeights) {
    weightsMap[w.topic] = w.weight
  }

  // ranqueia notícias usando algoritmo determinístico
  let rankedItems = rankItems(classifiedItems, weightsMap)

  // Cota Mínima Garantida de Pluralismo Geopolítico (pelo menos 2 matérias de fontes não-ocidentais/Sul Global)
  const nonWesternQuota = 2
  const currentNonWesternCount = rankedItems.filter(
    (i) => i.region && ['ORIENTE_MEDIO', 'ASIA_PACIFICO', 'SUL_GLOBAL'].includes(i.region)
  ).length

  if (currentNonWesternCount < nonWesternQuota) {
    const missing = nonWesternQuota - currentNonWesternCount
    const poolNonWestern = rankItems(
      classifiedItems.filter(
        (i) => i.region && ['ORIENTE_MEDIO', 'ASIA_PACIFICO', 'SUL_GLOBAL'].includes(i.region) &&
               !rankedItems.some((r) => r.url === i.url)
      ),
      weightsMap
    )
    const toInject = poolNonWestern.slice(0, missing)
    if (toInject.length > 0) {
      rankedItems = [...rankedItems.slice(0, Math.max(1, rankedItems.length - toInject.length)), ...toInject]
    }
  }

  // normaliza títulos e gera resumos em paralelo
  const originalTitles = rankedItems.map((i) => i.title)
  const summaryInputs = rankedItems.map((i) => ({ title: i.title, snippet: i.summary, topic: i.topic }))
  const [normalizedTitles, summaries] = await Promise.all([
    normalizeTitles(originalTitles, language),
    generateSummaries(summaryInputs, language),
  ])

  // persiste a edição (usa upsert para evitar corrida entre requisições concorrentes)
  const edition = await prisma.edition.upsert({
    where: { userId_date: { userId, date: today } },
    update: {},  // se já existe, não faz nada
    create: {
      userId,
      date: today,
      items: {
        create: rankedItems.map((item, idx) => ({
          topic: item.topic,
          sourceId: item.sourceId,
          sourceName: item.sourceName,
          originalTitle: item.title,
          normalizedTitle: normalizedTitles[idx],
          summary: summaries[idx] || `Desenvolvimentos em ${item.topic} registram desdobramentos operacionais para ${normalizedTitles[idx]}.`,
          imageUrl: item.imageUrl || getCategoryFallbackPhoto(item.topic, item.url),
          url: item.url,
          publishedAt: item.publishedAt,
          score: item.score,
          position: idx + 1,
        })),
      },
    },
  })

  console.log(`[EditionBuilder] Edição ${edition.id} criada para ${userId} com ${rankedItems.length} itens`)

  // Dispara notificação push automática se o usuário tiver dispositivos cadastrados
  const topTitle = normalizedTitles[0] || 'Sua edição do dia'
  sendPushNotificationToUser(userId, {
    title: 'feed pessoal 📰',
    body: `Sua edição diária está pronta: "${topTitle}"`,
    url: '/',
    tag: 'daily-edition'
  }).catch((err) => console.error('[EditionBuilder] Erro ao enviar push automático:', err))

  return 'success'
}

export async function getTodaysEdition(userId: string) {
  const today = new Date().toISOString().split('T')[0]
  const edition = await prisma.edition.findUnique({
    where: { userId_date: { userId, date: today } },
    include: { items: { orderBy: { position: 'asc' } } },
  })

  if (!edition) return null

  // Garante tradução em tempo real caso existam títulos em inglês legados gravados no banco
  const updatedItems = await Promise.all(
    edition.items.map(async (item) => {
      if (isProbablyEnglish(item.normalizedTitle)) {
        const translated = await translateSingleTitle(item.originalTitle || item.normalizedTitle)
        if (translated && translated !== item.normalizedTitle) {
          prisma.newsItem.update({
            where: { id: item.id },
            data: { normalizedTitle: translated }
          }).catch(() => {})
          return { ...item, normalizedTitle: translated }
        }
      }
      return item
    })
  )

  return { ...edition, items: updatedItems }
}
