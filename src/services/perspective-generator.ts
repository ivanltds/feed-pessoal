import { openai } from '@/lib/openai'
import { SUPPORTED_LANGUAGES } from './summary-generator'

export interface NewsPerspective {
  type: 'impact' | 'counterpoint' | 'outlook' | 'global_south'
  badge: string
  title: string
  summary: string
}

export interface PerspectivesResponse {
  newsItemId: string
  perspectives: NewsPerspective[]
}

export async function generatePerspectives(item: {
  id: string
  normalizedTitle: string
  topic: string
  summary?: string | null
  language?: string
}): Promise<PerspectivesResponse> {
  const language = item.language ?? 'pt-BR'
  const langName = SUPPORTED_LANGUAGES[language] ?? language

  const context = item.summary
    ? `Título da Notícia: ${item.normalizedTitle}\nResumo: ${item.summary}`
    : `Título da Notícia: ${item.normalizedTitle}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 800,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um analista sênior de inteligência de notícias e geopolítica global.
Analise a notícia fornecida e gere EXATAMENTE 4 perspectivas analíticas sem emojis em ${langName}.

REGRAS RÍGIDAS DE ANÁLISE:
1. Escreva a explicação ("summary") de cada perspectiva em 2 a 3 frases analíticas ricas e detalhadas.
2. Garanta que todos os títulos e resumos estejam 100% traduzidos para ${langName}.

Retorne um JSON válido com o formato exato:
{
  "perspectives": [
    {
      "type": "impact",
      "badge": "Impacto Prático",
      "title": "Título direto sobre os afetados",
      "summary": "Análise clara em 2-3 frases sobre quem é afetado diretamente e quais os efeitos operacionais."
    },
    {
      "type": "counterpoint",
      "badge": "Contraponto & Riscos",
      "title": "Título sobre dilemas ou críticas",
      "summary": "Análise clara em 2-3 frases sobre as controvérsias, dilemas e incertezas envolvidas."
    },
    {
      "type": "global_south",
      "badge": "Sul Global & Emergentes",
      "title": "Visão de Países Emergentes",
      "summary": "Análise fática de como o acontecimento afeta a Ásia, África e América Latina fora do eixo ocidental."
    },
    {
      "type": "outlook",
      "badge": "Próximos Passos",
      "title": "Título sobre desdobramentos futuros",
      "summary": "Análise clara em 2-3 frases sobre as expectativas de curto e médio prazo."
    }
  ]
}`
        },
        { role: 'user', content: context }
      ]
    })

    const content = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content) as { perspectives?: NewsPerspective[] }

    return {
      newsItemId: item.id,
      perspectives: parsed.perspectives ?? []
    }
  } catch (error) {
    console.error('[PerspectiveGenerator] Erro ao gerar perspectivas:', error)
    return {
      newsItemId: item.id,
      perspectives: [
        {
          type: 'impact',
          badge: 'Impacto Prático',
          title: 'Impacto direto no setor',
          summary: `Desdobramentos operacionais e estratégicos significativos sobre o setor de ${item.topic}, afetando empresas e profissionais envolvidos.`
        },
        {
          type: 'counterpoint',
          badge: 'Contraponto & Riscos',
          title: 'Dilemas e pontos de crítica',
          summary: 'Especialistas alertam para riscos de implementação, custos regulatórios e questionamentos de transparência no processo.'
        },
        {
          type: 'global_south',
          badge: 'Sul Global & Emergentes',
          title: 'Repercussão em países emergentes',
          summary: 'Análise de como a medida altera fluxos de investimento e arranjos geopolíticos na América Latina, Ásia e África.'
        },
        {
          type: 'outlook',
          badge: 'Próximos Passos',
          title: 'Tendências e projeções futuras',
          summary: 'Acompanhamento dos novos marcos de deliberação e dos relatórios oficiais previstos para as próximas semanas.'
        }
      ]
    }
  }
}
