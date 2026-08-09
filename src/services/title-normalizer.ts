import { openai } from '@/lib/openai'
import { SUPPORTED_LANGUAGES } from './summary-generator'

function buildPrompt(language: string): string {
  const langName = SUPPORTED_LANGUAGES[language] ?? language
  return `Você é um editor sênior de jornalismo internacional.
Sua tarefa é receber uma lista numerada de títulos de notícias (que podem vir de veículos internacionais em Inglês, Espanhol, Francês, etc.) e OBRIGATORIAMENTE TRADUZIR e normalizar CADA UM DOS TÍTULOS para ${langName}.

REGRAS RÍGIDAS DE TRADUÇÃO E EDITORIALISMO:
1. TRADUÇÃO OBRIGATÓRIA: Qualquer título em idioma estrangeiro DEVE ser integralmente traduzido para ${langName}. NUNCA retorne o título em inglês.
2. ANTI-CLICKBAIT: Elimine expressões sensacionalistas ("URGENTE", "SHOCKING", "BOMBÁSTICO", "você não vai acreditar").
3. PRECISÃO FACTUAL: Preserve os nomes próprios de marcas/empresas (ex: "X", "Google", "OpenAI", "Nikkei"), mas traduza integralmente a ação e o contexto para ${langName}.
4. Mantenha o título conciso, informativo e direto (máximo 90 caracteres).

Responda APENAS com um objeto JSON no formato exato:
{ "titles": ["título 1 traduzido", "título 2 traduzido", ...] }, respeitando rigorosamente a mesma ordem da lista.`
}

export async function normalizeTitles(titles: string[], language = 'pt-BR'): Promise<string[]> {
  if (titles.length === 0) return []

  try {
    const numbered = titles.map((t, i) => `${i + 1}. ${t}`).join('\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1000,
      temperature: 0.2,
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
      typeof normalized[i] === 'string' && normalized[i].trim().length > 0
        ? normalized[i].trim()
        : original
    )
  } catch (error) {
    console.error('[TitleNormalizer] Erro no batch:', error)
    return titles
  }
}
