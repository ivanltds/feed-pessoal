import { openai } from '@/lib/openai'
import { SUPPORTED_LANGUAGES } from './summary-generator'

export interface SuggestedQuestion {
  id: string
  text: string
  topic: string
  newsItemId: string
}

export async function generateSuggestedQuestions(
  item: { normalizedTitle: string; topic: string; id: string; summary?: string | null; language?: string }
): Promise<SuggestedQuestion[]> {
  const language = item.language ?? 'pt-BR'
  const langName = SUPPORTED_LANGUAGES[language] ?? language

  const context = item.summary
    ? `Título: ${item.normalizedTitle}\nResumo: ${item.summary}`
    : `Título: ${item.normalizedTitle}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: `You are a curious journalist helping readers go deeper on a news story.
Generate exactly 3 short questions about the news item.
Each question must:
- Be specific and thought-provoking (not generic)
- Reveal a different angle: practical impact, historical context, or future implication
- Be concise (max 80 characters)
- Be written in ${langName}

Respond ONLY with the 3 questions, one per line, no numbering, no quotes.`,
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
      id: `q-${item.id}-${i}`,
      text,
      topic: item.topic,
      newsItemId: item.id,
    }))
  } catch (error) {
    console.error('[QuestionGenerator] Erro:', error)
    return []
  }
}
