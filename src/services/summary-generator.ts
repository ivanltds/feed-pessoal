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
  return `Você é um jornalista sênior focado em jornalismo declarativo, informativo e direto.
Sua missão é gerar sínteses factual-informativas de 1 a 2 frases para cada notícia da lista em ${langName}.

PROIBIÇÕES RÍGIDAS DE ESTILO (NUNCA USE LINGUAGEM AUTO-DESCRITIVA OU META):
- NUNCA comece com "Síntese informativa sobre...", "Análise sobre...", "Resumo contendo...", "Esta matéria aborda...", "O texto fala de...".
- NUNCA descreva o que o resumo está fazendo.
- NUNCA insira frases de meta-comentário ou introduções genéricas.

REGRAS DE REDAÇÃO INFORMATIVA:
- Escreva DIRETAMENTE os fatos, a ação principal e as consequências em estilo jornalístico fluente.
- Exemplo Correto: "O governo húngaro indicou o ex-presidente da Suprema Corte Andras Baka para a presidência, visando reorganizar o sistema judiciário em meio a negociações com a União Europeia."
- Exemplo Errado (PROIBIDO): "Síntese informativa sobre Hungary nominates former Supreme Court chief..."

Se o trecho/snippet original estiver ausente ou em inglês, use o título e seu conhecimento fático para explicar a notícia diretamente no idioma ${langName}.

Responda APENAS com um objeto JSON no formato:
{ "summaries": ["resumo informativo 1", "resumo informativo 2", ...] }, na mesma ordem da lista.`
}

export interface SummaryInput {
  title: string
  snippet?: string | null
  topic?: string
}

export async function generateSingleInformativeSummary(title: string, topic = 'Geral', language = 'pt-BR'): Promise<string> {
  const langName = SUPPORTED_LANGUAGES[language] ?? language
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 150,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: `Você é um jornalista. Escreva 1 a 2 frases declarativas e puramente informativas explicando o contexto e os fatos principais por trás do título fornecido em ${langName}. NUNCA use expressões auto-descritivas ("Síntese sobre...", "Este artigo aborda..."). Escreva os fatos diretamente.`
        },
        { role: 'user', content: `Tópico: ${topic}\nTítulo: ${title}` }
      ]
    })
    const text = res.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, '') ?? ''
    if (text.length > 10 && !text.toLowerCase().startsWith('síntese') && !text.toLowerCase().startsWith('análise')) {
      return text
    }
    return `Desenvolvimentos recentes em ${topic} trazem novos desdobramentos operacionais e estratégicos para ${title}.`
  } catch {
    return `Desenvolvimentos recentes em ${topic} trazem novos desdobramentos operacionais e estratégicos para ${title}.`
  }
}

export async function generateSummaries(items: SummaryInput[], language = 'pt-BR'): Promise<string[]> {
  if (items.length === 0) return []

  let rawSummaries: string[] = []

  try {
    const list = items
      .map((item, idx) => {
        const snippetText = item.snippet && item.snippet.trim().length > 0
          ? item.snippet.trim()
          : 'Trecho ausente — explique o fato direto a partir do título.'
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
    rawSummaries = parsed.summaries || parsed.result || (Array.isArray(parsed) ? parsed : [])
  } catch (error) {
    console.error('[SummaryGenerator] Erro no batch:', error)
  }

  // Segunda etapa: garante que nenhuma resposta venha auto-descritiva ou nula
  const finalSummaries = await Promise.all(
    items.map(async (item, i) => {
      const candidate = typeof rawSummaries[i] === 'string' ? rawSummaries[i].trim() : ''
      const isAutoDescriptive = candidate.toLowerCase().startsWith('síntese') ||
                                candidate.toLowerCase().startsWith('análise') ||
                                candidate.toLowerCase().startsWith('resumo') ||
                                candidate.toLowerCase().startsWith('este artigo')

      if (candidate.length > 10 && !isAutoDescriptive) {
        return candidate
      }

      console.log(`[SummaryGenerator] Gerando resumo informativo único para: "${item.title}"`)
      return await generateSingleInformativeSummary(item.title, item.topic, language)
    })
  )

  return finalSummaries
}
