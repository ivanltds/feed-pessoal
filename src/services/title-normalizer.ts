import { openai } from '@/lib/openai'

const SYSTEM_PROMPT = `Você é um editor de notícias especializado em neutralidade e clareza.
Receberá uma lista numerada de títulos. Para cada um:
- Remova clickbait ("CHOCANTE", "INACREDITÁVEL", "você não vai acreditar", etc.)
- Elimine linguagem alarmista desnecessária
- Preserve a informação central e factual
- Mantenha concisão (máximo 90 caracteres)
- Use linguagem neutra e declarativa
- NÃO adicione informações que não estejam no título original

Responda APENAS com um JSON array de strings, na mesma ordem, sem explicações.
Exemplo de resposta: ["Título 1 normalizado", "Título 2 normalizado"]`

export async function normalizeTitles(titles: string[]): Promise<string[]> {
  if (titles.length === 0) return []

  try {
    const numbered = titles.map((t, i) => `${i + 1}. ${t}`).join('\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + '\nResponda no formato: {"titles": [...]}' },
        { role: 'user', content: numbered },
      ],
    })

    const content = response.choices[0]?.message?.content?.trim() ?? ''
    const parsed = JSON.parse(content)
    const normalized: string[] = parsed.titles ?? []

    // Garante que retornamos o mesmo número de títulos (fallback para original se algo falhar)
    return titles.map((original, i) =>
      typeof normalized[i] === 'string' && normalized[i].length > 0
        ? normalized[i]
        : original
    )
  } catch (error) {
    console.error('[TitleNormalizer] Erro no batch:', error)
    return titles // fallback: retorna títulos originais
  }
}
