import { openai } from '@/lib/openai'
import type { RawNewsItem } from '@/domain/news/types'

export async function classifyNewsItems(
  items: RawNewsItem[],
  userActiveTopics: string[],
  language = 'pt-BR'
): Promise<RawNewsItem[]> {
  if (items.length === 0 || userActiveTopics.length === 0) return items

  const itemsPayload = items.map((it, idx) => ({
    id: idx,
    title: it.title,
    summary: it.summary?.slice(0, 150) ?? '',
    source: it.sourceName
  }))

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1200,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um editor sênior de jornalismo encarregado de classificar notícias com 100% de precisão factual.

Sua tarefa é analisar cada notícia (título e resumo) e determinar a QUAL categoria ela pertence estritamente dentro da lista de categorias permitidas do usuário.

REGRAS RÍGIDAS DE CLASSIFICAÇÃO:
- Notícias sobre Putin, Rússia, Ucrânia, guerras, tratados internacionais ou política externa → pertencem a "Geopolítica", "Mundo" ou "Relações Internacionais". NUNCA a "América Latina" (a menos que envolva diretamente o continente latino-americano).
- Notícias sobre jogos, filmes, séries, atores, estúdios ou adaptações de entretenimento (ex: Resident Evil) → pertencem a "Cinema & Séries", "Games & Esports" ou "Cultura". NUNCA a "Computação Quântica" ou categorias científicas.
- Se uma notícia não se encaixar com clareza em NENHUMA das categorias permitidas do usuário, atribua o valor "unmatched".

CATEGORIAS PERMITIDAS DO USUÁRIO:
${JSON.stringify(userActiveTopics)}

Retorne um JSON com a estrutura exata:
{
  "classifications": [
    { "id": 0, "topic": "NomeDaCategoriaExata" },
    ...
  ]
}`
        },
        { role: 'user', content: JSON.stringify(itemsPayload) }
      ]
    })

    const content = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content) as {
      classifications?: { id: number; topic: string }[]
    }

    const classificationsMap = new Map<number, string>()
    if (parsed.classifications) {
      for (const c of parsed.classifications) {
        if (c.topic && c.topic !== 'unmatched' && userActiveTopics.includes(c.topic)) {
          classificationsMap.set(c.id, c.topic)
        }
      }
    }

    // Aplica a classificação semântica validada pela IA
    const classifiedItems: RawNewsItem[] = []
    items.forEach((item, idx) => {
      const aiTopic = classificationsMap.get(idx)
      if (aiTopic) {
        classifiedItems.push({
          ...item,
          topic: aiTopic
        })
      } else if (userActiveTopics.includes(item.topic)) {
        // Se a tag original do RSS já bate exatamente com um tópico do usuário, mantém
        classifiedItems.push(item)
      }
    })

    return classifiedItems
  } catch (error) {
    console.error('[TopicClassifier] Erro ao classificar notícias:', error)
    return items
  }
}
