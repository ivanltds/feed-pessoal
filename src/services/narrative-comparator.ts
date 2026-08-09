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
      max_tokens: 800,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um analista universal de inteligência de notícias, antropologia social e geopolítica.
Dada a notícia fornecida (qualquer que seja o tema: Esportes, Geopolítica, Economia, Tecnologia, Sociedade, Cidades ou Cultura), sua tarefa é identificar de 2 até NO MÁXIMO 5 partes interessadas (atores, lados envolvidos ou grupos humanos/institucionais afetados).

EXEMPLOS DE ATRIBUIÇÃO DE ATORES CONTEXTUAIS:
- Se for briga de torcidas em esportes → Atores: Torcida A, Torcida Rival B, Família do agredido, Comerciantes/Moradores locais, Organização/Polícia.
- Se for guerra ou diplomacia → Atores: Governo A, Governo B, Nações Aliadas, Sul Global/Emergentes, População local afetada.
- Se for taxação ou regulamentação → Atores: Consumidores, Pequenos Importadores/Empresas, Indústria Nacional, Ministério da Fazenda, Plataformas Globais.

REGRAS:
- Extraia de 2 a 5 atores reais do contexto.
- Para cada ator, forneça o nome do grupo ("name"), o título curto da posição ("title") e uma síntese de 1 a 2 frases da perspectiva/enquadramento fático ("summary").
- Escreva obrigatoriamente em ${langName}.

Retorne um JSON exatamente no formato:
{
  "actors": [
    {
      "id": "identificador_unico_slug",
      "name": "Nome do Ator / Parte Interessada",
      "title": "Título curto do enquadramento (máx 50 caracteres)",
      "summary": "Síntese fática de 1-2 frases da visão deste ator."
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
      summary: a.summary || 'Análise da perspectiva desta parte interessada sobre o acontecimento.'
    }))

    if (sanitizedActors.length === 0) {
      return {
        newsItemId: item.id,
        actors: [
          {
            id: 'institucional',
            name: 'Perspectiva Institucional',
            title: 'Posição dos Órgãos Oficiais',
            summary: 'Enquadramento focado nas normativas e declarações oficiais sobre o acontecimento.'
          },
          {
            id: 'afetados',
            name: 'Partes Afetadas Diretas',
            title: 'Impacto nos Grupos Envolvidos',
            summary: 'Visão fática das pessoas, comunidades ou mercados diretamente atingidos.'
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
          summary: 'Enquadramento focado nas normativas e declarações oficiais sobre o acontecimento.'
        },
        {
          id: 'afetados',
          name: 'Partes Afetadas Diretas',
          title: 'Impacto nos Grupos Envolvidos',
          summary: 'Visão fática das pessoas, comunidades ou mercados diretamente atingidos.'
        }
      ]
    }
  }
}
