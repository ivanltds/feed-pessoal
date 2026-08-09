import { openai } from '@/lib/openai'
import { SUPPORTED_LANGUAGES } from './summary-generator'

export interface NarrativeActor {
  id: string
  name: string
  title: string
  summary: string
}

export interface NarrativeComparisonResult {
  newsItemId: string
  actors: NarrativeActor[]
}

export async function compareNarratives(item: {
  id: string
  normalizedTitle: string
  topic: string
  summary?: string | null
  sourceName?: string
  language?: string
}): Promise<NarrativeComparisonResult> {
  const language = item.language ?? 'pt-BR'
  const langName = SUPPORTED_LANGUAGES[language] ?? language

  const context = `Tópico: ${item.topic}\nTítulo da Notícia: ${item.normalizedTitle}\nFonte: ${item.sourceName ?? 'Geral'}\nResumo/Fato: ${item.summary ?? ''}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1200,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um analista sênior de inteligência de notícias, antropologia social e geopolítica internacional.
Dada a notícia fornecida (qualquer que seja o tema: Esportes, Geopolítica, Economia, Tecnologia, Sociedade, Cidades ou Cultura), sua tarefa é identificar de 2 até NO MÁXIMO 5 partes interessadas (atores, lados envolvidos ou grupos humanos/institucionais afetados).

REGRAS RÍGIDAS DE ELABORAÇÃO:
1. Identifique de 2 a 5 atores reais e distintos envolvidos no contexto da notícia.
2. Para CADA ator, elabore um texto analítico aprofundado ("summary") de 3 a 4 frases detalhadas. Explique claramente as motivações desse ator, seus argumentos centrais, suas preocupações factuais e sua justificativa sobre o acontecimento.
3. Evite frases genéricas de 1 linha. Forneça substância fática e riqueza de perspectiva para cada lado.
4. Escreva obrigatoriamente em ${langName}.

Retorne um JSON exatamente no formato:
{
  "actors": [
    {
      "id": "identificador_unico_slug",
      "name": "Nome do Ator / Parte Interessada",
      "title": "Título do Enquadramento (máx 50 caracteres)",
      "summary": "Análise elaborada de 3 a 4 frases detalhadas cobrindo os argumentos, preocupações e justificativa deste ator."
    }
  ]
}`
        },
        { role: 'user', content: context }
      ]
    })

    const content = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content) as { actors?: NarrativeActor[] }

    const rawActors = parsed.actors ?? []
    const sanitizedActors: NarrativeActor[] = rawActors.slice(0, 5).map((a, idx) => ({
      id: a.id || `actor-${idx}`,
      name: a.name || `Parte Interessada ${idx + 1}`,
      title: a.title || 'Enquadramento fático',
      summary: a.summary || `Análise detalhada sobre o enquadramento e os desdobramentos desta parte interessada em relação a ${item.normalizedTitle}.`
    }))

    if (sanitizedActors.length === 0) {
      return {
        newsItemId: item.id,
        actors: [
          {
            id: 'institucional',
            name: 'Perspectiva Institucional',
            title: 'Posição dos Órgãos Oficiais',
            summary: `Defesa das normativas oficiais e diretrizes regulatórias aplicáveis a ${item.normalizedTitle}. Argumenta pelo cumprimento das regras vigentes e pela estabilidade das operações.`
          },
          {
            id: 'afetados',
            name: 'Partes Afetadas Diretas',
            title: 'Impacto nos Grupos Envolvidos',
            summary: `Visão fática das pessoas, comunidades ou empresas diretamente atingidas pelos desdobramentos de ${item.normalizedTitle}. Aponta os custos práticos e os desafios gerados pela medida.`
          }
        ]
      }
    }

    return {
      newsItemId: item.id,
      actors: sanitizedActors
    }
  } catch (error) {
    console.error('[NarrativeComparator] Erro ao extrair partes interessadas:', error)
    return {
      newsItemId: item.id,
      actors: [
        {
          id: 'institucional',
          name: 'Perspectiva Institucional',
          title: 'Posição dos Órgãos Oficiais',
          summary: `Defesa das normativas oficiais e diretrizes regulatórias aplicáveis a ${item.normalizedTitle}. Argumenta pelo cumprimento das regras vigentes e pela estabilidade das operações.`
        },
        {
          id: 'afetados',
          name: 'Partes Afetadas Diretas',
          title: 'Impacto nos Grupos Envolvidos',
          summary: `Visão fática das pessoas, comunidades ou empresas diretamente atingidas pelos desdobramentos de ${item.normalizedTitle}. Aponta os custos práticos e os desafios gerados pela medida.`
        }
      ]
    }
  }
}
