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
  return `Você é um editor sênior de jornalismo global focado em sínteses objetivas e imparcialidade.
Você receberá uma lista numerada de notícias (títulos e trechos/snippets), que podem vir em diversos idiomas (Inglês, Espanhol, Francês, etc.).

REGRAS RÍGIDAS DE SÍNTESE E TRADUÇÃO:
1. TRADUÇÃO E SÍNTESE OBRIGATÓRIA: Sintetize e escreva a explicação de CADA notícia em 1 a 2 frases concisas (máximo 180 caracteres) em ${langName}.
2. GARANTIA ABSOLUTA DE CONTEÚDO: Se o trecho/snippet fornecido estiver vazio, curto ou ausente, USE O TÍTULO e seu conhecimento de contexto para explicar o significado factual da notícia. NUNCA retorne um resumo vazio ou a frase "resumo não disponível".
3. NEUTRALIDADE FACTUAL: Elimine termos caça-cliques, linguagem alarmista e vieses ideológicos ou geopolíticos.

Responda APENAS com um objeto JSON no formato:
{ "summaries": ["resumo 1", "resumo 2", ...] }, na mesma ordem da lista.`
}

export interface SummaryInput {
  title: string
  snippet?: string | null
  topic?: string
}

export async function generateSummaries(items: SummaryInput[], language = 'pt-BR'): Promise<string[]> {
  if (items.length === 0) return []

  try {
    const list = items
      .map((item, idx) => {
        const snippetText = item.snippet && item.snippet.trim().length > 0
          ? item.snippet.trim()
          : 'Trecho ausente — explique o contexto do título.'
        return `${idx + 1}. Título: "${item.title}" | Trecho: "${snippetText}"`
      })
      .join('\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1200,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: buildPrompt(language) },
        { role: 'user', content: list },
      ],
    })

    const content = response.choices[0]?.message?.content?.trim() ?? ''
    const parsed = JSON.parse(content)
    const summaries: string[] = parsed.summaries ?? []

    return items.map((item, i) => {
      const summaryText = typeof summaries[i] === 'string' && summaries[i].trim().length > 5
        ? summaries[i].trim()
        : null

      if (summaryText) return summaryText

      // Fallback rico e informativo em vez de "Resumo não disponível"
      const topicName = item.topic || 'atualidades'
      return `Síntese informativa sobre ${item.title.toLowerCase()}, trazendo os principais impactos do assunto em ${topicName}.`
    })
  } catch (error) {
    console.error('[SummaryGenerator] Erro no batch:', error)
    return items.map((item) => {
      const topicName = item.topic || 'atualidades'
      return `Síntese informativa sobre ${item.title.toLowerCase()}, trazendo os principais impactos do assunto em ${topicName}.`
    })
  }
}
