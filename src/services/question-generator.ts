import { openai } from '@/lib/openai'

export interface SuggestedQuestion {
  id: string
  text: string
  topic: string
  newsItemId: string
}

export async function generateSuggestedQuestions(
  topNewsItem: { normalizedTitle: string; topic: string; id: string; summary?: string | null }
): Promise<SuggestedQuestion[]> {
  const context = topNewsItem.summary
    ? `Título: ${topNewsItem.normalizedTitle}\nContexto: ${topNewsItem.summary}`
    : `Título: ${topNewsItem.normalizedTitle}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: `Você é um jornalista curioso que ajuda leitores a se aprofundarem em notícias.
Gere exatamente 3 perguntas diferentes sobre o tema da notícia.
Cada pergunta deve ser:
- Específica e provocadora (não genérica)
- Revelar um ângulo diferente: impacto prático, contexto histórico, ou implicação futura
- Curta (máximo 80 caracteres)
- Em português do Brasil

Responda APENAS com as 3 perguntas, uma por linha, sem numeração, sem aspas.`,
        },
        { role: 'user', content: context },
      ],
    })

    const text = response.choices[0]?.message?.content ?? ''
    const questions = text
      .split('\n')
      .map((q) => q.trim())
      .filter((q) => q.length > 10)
      .slice(0, 3)

    return questions.map((text, i) => ({
      id: `q-${topNewsItem.id}-${i}`,
      text,
      topic: topNewsItem.topic,
      newsItemId: topNewsItem.id,
    }))
  } catch (error) {
    console.error('[QuestionGenerator] Erro:', error)
    return [
      {
        id: `q-${topNewsItem.id}-0`,
        text: `O que mais você quer saber sobre ${topNewsItem.topic.toLowerCase()}?`,
        topic: topNewsItem.topic,
        newsItemId: topNewsItem.id,
      },
    ]
  }
}
