import { openai } from '@/lib/openai'
import { SUPPORTED_LANGUAGES } from './summary-generator'

const COMMON_ENGLISH_WORDS = [
  'the', 'of', 'and', 'to', 'in', 'for', 'with', 'on', 'at', 'from', 'by', 'about',
  'is', 'are', 'was', 'were', 'be', 'been', 'will', 'should', 'would', 'could',
  'seek', 'seeks', 'makes', 'makes', 'comes', 'comes', 'overseas', 'former', 'chief',
  'presidency', 'says', 'said', 'after', 'new', 'first', '1st', '2nd', '3rd', 'over'
]

export function isProbablyEnglish(text: string): boolean {
  if (!text) return false
  const lower = text.toLowerCase()
  const words = lower.replace(/[^a-z0-9\s]/g, '').split(/\s+/)
  let englishCount = 0
  for (const w of words) {
    if (COMMON_ENGLISH_WORDS.includes(w)) englishCount++
  }
  return englishCount >= 2 || (words.length > 0 && englishCount / words.length >= 0.25)
}

function buildPrompt(language: string): string {
  const langName = SUPPORTED_LANGUAGES[language] ?? language
  return `Você é um editor sênior de jornalismo internacional.
Sua tarefa é receber uma lista numerada de títulos de notícias (que podem vir de veículos internacionais em Inglês, Espanhol, Francês, etc.) e OBRIGATORIAMENTE TRADUZIR e normalizar CADA UM DOS TÍTULOS para ${langName}.

REGRAS RÍGIDAS DE TRADUÇÃO E EDITORIALISMO:
1. TRADUÇÃO OBRIGATÓRIA: Qualquer título em idioma estrangeiro DEVE ser integralmente traduzido para ${langName}. NUNCA retorne o título em inglês.
2. ANTI-CLICKBAIT: Elimine expressões sensacionalistas ("URGENTE", "SHOCKING", "BOMBÁSTICO", "você não vai acreditar").
3. PRECISÃO FACTUAL: Preserve os nomes próprios de marcas/empresas (ex: "X", "Google", "OpenAI", "Nikkei", "BTS"), mas traduza integralmente a ação e o contexto para ${langName}.
4. Mantenha o título conciso, informativo e direto (máximo 90 caracteres).

Responda APENAS com um objeto JSON no formato exato:
{ "titles": ["título 1 traduzido", "título 2 traduzido", ...] }, respeitando rigorosamente a mesma ordem da lista.`
}

export async function translateSingleTitle(title: string, language = 'pt-BR'): Promise<string> {
  const langName = SUPPORTED_LANGUAGES[language] ?? language
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 150,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: `Você é um tradutor jornalístico. Traduza o título de notícia a seguir para ${langName}. Responda APENAS com o título traduzido sem aspas nem explicações.`
        },
        { role: 'user', content: title }
      ]
    })
    const translated = res.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') ?? ''
    return translated.length > 0 ? translated : title
  } catch {
    return title
  }
}

export async function normalizeTitles(titles: string[], language = 'pt-BR'): Promise<string[]> {
  if (titles.length === 0) return []

  let normalized: string[] = []

  try {
    const numbered = titles.map((t, i) => `${i + 1}. ${t}`).join('\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1200,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildPrompt(language) },
        { role: 'user', content: numbered },
      ],
    })

    const content = response.choices[0]?.message?.content?.trim() ?? ''
    const parsed = JSON.parse(content)
    
    // Extração flexível de chaves JSON
    const rawList = parsed.titles || parsed.normalized_titles || parsed.result || parsed.data || (Array.isArray(parsed) ? parsed : [])
    if (Array.isArray(rawList)) {
      normalized = rawList.map((t) => (typeof t === 'string' ? t.trim() : ''))
    }
  } catch (error) {
    console.error('[TitleNormalizer] Erro no batch:', error)
  }

  // Segunda etapa: garante que qualquer título que ainda tenha ficado em inglês seja traduzido individualmente
  const finalTitles = await Promise.all(
    titles.map(async (original, i) => {
      const candidate = normalized[i] && normalized[i].length > 0 ? normalized[i] : original
      if (isProbablyEnglish(candidate)) {
        console.log(`[TitleNormalizer] Traduzindo título em inglês via single-pass: "${candidate}"`)
        return await translateSingleTitle(original, language)
      }
      return candidate
    })
  )

  return finalTitles
}
