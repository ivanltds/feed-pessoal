import { openai } from '@/lib/openai'

const SYSTEM_PROMPT = `Você é um editor de notícias especializado em neutralidade e clareza.
Sua tarefa é reescrever títulos de notícias para:
- Remover clickbait e sensacionalismo ("CHOCANTE", "INACREDITÁVEL", "você não vai acreditar")
- Eliminar linguagem alarmista desnecessária
- Preservar a informação central e factual
- Manter concisão (máximo 90 caracteres)
- Usar linguagem neutra e declarativa
- NÃO adicionar informações que não estejam no título original

Responda APENAS com o título reescrito, sem aspas, sem explicações.`

export async function normalizeTitle(originalTitle: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 100,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: originalTitle },
      ],
    })

    return response.choices[0]?.message?.content?.trim() ?? originalTitle
  } catch (error) {
    console.error('[TitleNormalizer] Erro:', error)
    return originalTitle
  }
}

export async function normalizeTitles(titles: string[]): Promise<string[]> {
  const BATCH_SIZE = 5
  const results: string[] = []

  for (let i = 0; i < titles.length; i += BATCH_SIZE) {
    const batch = titles.slice(i, i + BATCH_SIZE)
    const normalized = await Promise.all(batch.map(normalizeTitle))
    results.push(...normalized)
  }

  return results
}
