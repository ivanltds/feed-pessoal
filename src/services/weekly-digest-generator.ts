import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export interface WeeklyHighlight {
  topic: string
  title: string
  timeline: { date: string; fact: string }[]
  keyTakeaway: string
}

export interface WeeklyDigest {
  dateRange: string
  summary: string
  highlights: WeeklyHighlight[]
}

export async function generateWeeklyDigest(userId: string): Promise<WeeklyDigest> {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  // Busca edições e notícias dos últimos 7 dias
  const userEditions = await prisma.edition.findMany({
    where: {
      userId,
      publishedAt: { gte: sevenDaysAgo }
    },
    include: {
      items: {
        orderBy: { score: 'desc' },
        take: 15
      }
    },
    orderBy: { date: 'desc' }
  })

  const allItems = userEditions.flatMap((ed) => ed.items)

  if (allItems.length === 0) {
    return {
      dateRange: 'Últimos 7 dias',
      summary: 'Ainda não há edições registradas na sua conta nos últimos 7 dias.',
      highlights: []
    }
  }

  const itemsContext = allItems.slice(0, 20).map((it) => `- [${it.topic}] ${it.normalizedTitle}: ${it.summary ?? ''}`).join('\n')

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 700,
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um editor executivo do leitor 'feed pessoal'.
Analise as principais notícias dos últimos 7 dias do usuário e crie uma Retrospectiva Inteligente da Semana em português (pt-BR).

Retorne um JSON exatamente neste formato:
{
  "summary": "Um resumo executivo em 2 frases sobre os grandes movimentos da semana.",
  "highlights": [
    {
      "topic": "Nome do Tópico",
      "title": "Título do Fato da Semana",
      "timeline": [
        { "date": "Segunda/Terça", "fact": "Acontecimento inicial relevante" },
        { "date": "Quinta/Sexta", "fact": "Desdobramento ou desfecho da semana" }
      ],
      "keyTakeaway": "Conclusão ou impacto do assunto."
    }
  ]
}`
        },
        { role: 'user', content: itemsContext }
      ]
    })

    const content = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content) as { summary?: string; highlights?: WeeklyHighlight[] }

    const now = new Date()
    const startDate = new Date(sevenDaysAgo).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
    const endDate = now.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })

    return {
      dateRange: `${startDate} a ${endDate}`,
      summary: parsed.summary ?? 'Resumo da semana indisponível no momento.',
      highlights: parsed.highlights ?? []
    }
  } catch (error) {
    console.error('[WeeklyDigest] Erro ao gerar retrospectiva:', error)
    return {
      dateRange: 'Últimos 7 dias',
      summary: 'Não foi possível gerar o resumo semanal no momento.',
      highlights: []
    }
  }
}
