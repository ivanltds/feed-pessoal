import { openai } from '@/lib/openai'
import { SUPPORTED_LANGUAGES } from './summary-generator'

function buildPrompt(language: string): string {
  const langName = SUPPORTED_LANGUAGES[language] ?? language
  return `You are a neutral, factual news editor.
You will receive a numbered list of news titles. For each one:
- Remove clickbait ("SHOCKING", "UNBELIEVABLE", "you won't believe", etc.)
- Remove unnecessary alarmist language
- Preserve the core factual information
- Keep it concise (max 90 characters)
- Use neutral, declarative language
- Do NOT add information not present in the original title

IMPORTANT: Translate and write every title in ${langName}.

Respond ONLY with a JSON object in the format: {"titles": ["title 1", "title 2", ...]}, in the same order, no explanations.`
}

export async function normalizeTitles(titles: string[], language = 'pt-BR'): Promise<string[]> {
  if (titles.length === 0) return []

  try {
    const numbered = titles.map((t, i) => `${i + 1}. ${t}`).join('\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 800,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildPrompt(language) },
        { role: 'user', content: numbered },
      ],
    })

    const content = response.choices[0]?.message?.content?.trim() ?? ''
    const parsed = JSON.parse(content)
    const normalized: string[] = parsed.titles ?? []

    return titles.map((original, i) =>
      typeof normalized[i] === 'string' && normalized[i].length > 0
        ? normalized[i]
        : original
    )
  } catch (error) {
    console.error('[TitleNormalizer] Erro no batch:', error)
    return titles
  }
}
