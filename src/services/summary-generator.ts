import { openai } from '@/lib/openai'

export const SUPPORTED_LANGUAGES: Record<string, string> = {
  'pt-BR': 'Português (Brasil)',
  'pt-PT': 'Português (Portugal)',
  'en':    'English',
  'es':    'Español',
  'fr':    'Français',
  'de':    'Deutsch',
  'ja':    '日本語',
  'zh':    '中文 (简体)',
  'ar':    'العربية',
  'hi':    'हिन्दी',
}

function buildPrompt(language: string): string {
  const langName = SUPPORTED_LANGUAGES[language] ?? language
  return `You are an impartial, global news editor focused on factual neutrality and multi-perspective clarity.
You will receive a numbered list of news items (titles & excerpts), which may come from international sources in various languages (English, Spanish, French, etc.).

For each item:
1. Translate and synthesize the summary into ${langName}.
2. Use neutral, declarative, factual language — strictly eliminate Western or regional bias, clickbait, and alarmist framing.
3. Provide objective 1-2 sentence summaries (max 180 characters) highlighting core facts and real-world consequences without taking geopolitical sides.

IMPORTANT: Write every summary in ${langName}. Translate if necessary.

Respond ONLY with a JSON object: {"summaries": ["summary 1", "summary 2", ...]}, in the same order, no explanations.`
}

interface NewsInput {
  title: string
  snippet?: string
}

export async function generateSummaries(items: NewsInput[], language = 'pt-BR'): Promise<string[]> {
  if (items.length === 0) return []

  try {
    const numbered = items
      .map((item, i) => {
        const snippet = item.snippet ? ` | Excerpt: ${item.snippet.slice(0, 200)}` : ''
        return `${i + 1}. ${item.title}${snippet}`
      })
      .join('\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1200,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildPrompt(language) },
        { role: 'user', content: numbered },
      ],
    })

    const content = response.choices[0]?.message?.content?.trim() ?? ''
    const parsed = JSON.parse(content)
    const summaries: string[] = parsed.summaries ?? []

    return items.map((_, i) =>
      typeof summaries[i] === 'string' && summaries[i].length > 0
        ? summaries[i]
        : ''
    )
  } catch (error) {
    console.error('[SummaryGenerator] Erro no batch:', error)
    return items.map(() => '')
  }
}
