import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'

export interface EditionBriefing {
  highlights: string[]
  suggestedPills: { label: string; question: string }[]
}

export async function generateEditionBriefing(editionId: string): Promise<EditionBriefing> {
  const items = await prisma.newsItem.findMany({
    where: { editionId },
    orderBy: { score: 'desc' },
    take: 10,
    select: { topic: true, normalizedTitle: true, summary: true }
  })

  if (items.length === 0) {
    return {
      highlights: ['Sua edição do dia foi concluída!'],
      suggestedPills: [
        { label: '🚀 Resumo de Tecnologia', question: 'Quais foram os principais avanços em tecnologia hoje?' },
        { label: '📈 Panorama de Economia', question: 'Quais os principais destaques econômicos do dia?' }
      ]
    }
  }

  const itemsText = items.map((it) => `- [${it.topic}] ${it.normalizedTitle}`).join('\n')

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 400,
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um curador de notícias sintetizando o feed pessoal do usuário.
Gere 3 destaques principais e 3 pílulas rápidas de aprofundamento para o fechamento do feed em português (pt-BR).

Retorne um JSON com a estrutura exata:
{
  "highlights": [
    "Destaque 1 unindo o fato principal em 1 frase curta.",
    "Destaque 2 com foco em economia/tendência.",
    "Destaque 3 com ponto importante da edição."
  ],
  "suggestedPills": [
    { "label": "🚀 Pílula 1", "question": "Pergunta curta e direta sobre a pílula 1" },
    { "label": "📈 Pílula 2", "question": "Pergunta curta e direta sobre a pílula 2" },
    { "label": "🔍 Pílula 3", "question": "Pergunta curta e direta sobre a pílula 3" }
  ]
}`
        },
        { role: 'user', content: itemsText }
      ]
    })

    const content = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content) as {
      highlights?: string[]
      suggestedPills?: { label: string; question: string }[]
    }

    return {
      highlights: parsed.highlights ?? ['Você concluiu a leitura da sua edição de hoje.'],
      suggestedPills: parsed.suggestedPills ?? []
    }
  } catch (error) {
    console.error('[EditionBriefing] Erro:', error)
    return {
      highlights: ['Você concluiu a leitura da sua edição do dia.'],
      suggestedPills: []
    }
  }
}
