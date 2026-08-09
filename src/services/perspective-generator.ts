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
    ? `Título: ${item.normalizedTitle}\nResumo: ${item.summary}`
    : `Título: ${item.normalizedTitle}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um analista sênior de inteligência de notícias e geopolítica global.
Analise a notícia fornecida e gere EXATAMENTE 4 perspectivas analíticas sem emojis em ${langName}.

Retorne um JSON válido com o seguinte formato exato:
{
  "perspectives": [
    {
      "type": "impact",
      "badge": "Impacto Prático",
      "title": "Título curto sobre o impacto (máx 60 caracteres)",
      "summary": "Explicação concisa e clara em 1-2 frases sobre quem é afetado e como."
    },
    {
      "type": "counterpoint",
      "badge": "Contraponto & Riscos",
      "title": "Título curto sobre o risco ou crítica (máx 60 caracteres)",
      "summary": "Explicação concisa e clara em 1-2 frases sobre dilemas, críticas ou incertezas."
    },
    {
      "type": "global_south",
      "badge": "Sul Global & Emergentes",
      "title": "Visão da Ásia, África e América Latina (máx 60 caracteres)",
      "summary": "Explicação concisa de como o fato afeta países emergentes ou é percebido fora do eixo ocidental."
    },
    {
      "type": "outlook",
      "badge": "Próximos Passos",
      "title": "Título curto sobre o que esperar (máx 60 caracteres)",
      "summary": "Explicação concisa e clara em 1-2 frases sobre os desdobramentos futuros."
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
          title: 'Análise de impacto em andamento',
          summary: 'Esta notícia impacta diretamente as dinâmicas de ' + item.topic + '.'
        },
        {
          type: 'counterpoint',
          badge: 'Contraponto & Riscos',
          title: 'Pontos de atenção',
          summary: 'Especialistas acompanham os riscos operacionais e regulatórios envolvidos.'
        },
        {
          type: 'global_south',
          badge: 'Sul Global & Emergentes',
          title: 'Perspectiva dos emergentes',
          summary: 'Análise sobre os reflexos geopolíticos e econômicos na Ásia, África e América Latina.'
        },
        {
          type: 'outlook',
          badge: 'Próximos Passos',
          title: 'Desdobramentos futuros',
          summary: 'Novas atualizações são esperadas nos próximos ciclos de notícias.'
        }
      ]
    }
  }
}
