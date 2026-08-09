import { openai } from '@/lib/openai'
import { SUPPORTED_LANGUAGES } from './summary-generator'

export interface NarrativeComparisonResult {
  newsItemId: string
  westernPerspective: {
    title: string
    summary: string
  }
  globalSouthPerspective: {
    title: string
    summary: string
  }
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

  const context = `Título: ${item.normalizedTitle}\nTópico: ${item.topic}\nFonte: ${item.sourceName ?? 'Global'}\nResumo: ${item.summary ?? ''}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um analista geopolítico internacional imparcial especializado em crítica comparativa de mídia.
Sua tarefa é analisar o fato da notícia e gerar um confronto analítico entre duas narrativas em ${langName}:
1. "westernPerspective": Como a imprensa tradicional ocidental (EUA/Europa Ocidental) costuma cobrir e enquadrar este tipo de fato.
2. "globalSouthPerspective": Como este mesmo fato é interpretado pela perspectiva do Sul Global, economias emergentes (BRICS/Ásia/África/América Latina) ou veículos não-ocidentais.

Retorne um JSON exatamente no formato:
{
  "westernPerspective": {
    "title": "Enquadramento Ocidental (máx 50 caracteres)",
    "summary": "Resumo explicativo em 2 frases curtas."
  },
  "globalSouthPerspective": {
    "title": "Visão do Sul Global & Emergentes (máx 50 caracteres)",
    "summary": "Resumo explicativo em 2 frases curtas."
  }
}`
        },
        { role: 'user', content: context }
      ]
    })

    const content = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content) as {
      westernPerspective?: { title: string; summary: string }
      globalSouthPerspective?: { title: string; summary: string }
    }

    return {
      newsItemId: item.id,
      westernPerspective: parsed.westernPerspective ?? {
        title: 'Enquadramento Institucional Ocidental',
        summary: 'Foco na estabilidade de mercado e alinhamento às diretrizes regulatórias norte-americanas e europeias.'
      },
      globalSouthPerspective: parsed.globalSouthPerspective ?? {
        title: 'Perspectiva dos Países Emergentes',
        summary: 'Foco nos impactos de soberania, desenvolvimento local e autonomia em relação ao eixo ocidental.'
      }
    }
  } catch (error) {
    console.error('[NarrativeComparator] Erro ao comparar narrativas:', error)
    return {
      newsItemId: item.id,
      westernPerspective: {
        title: 'Enquadramento Institucional Ocidental',
        summary: 'Foco na estabilidade de mercado e diretrizes ocidentais.'
      },
      globalSouthPerspective: {
        title: 'Perspectiva dos Países Emergentes',
        summary: 'Foco nos impactos de desenvolvimento local e autonomia dos mercados emergentes.'
      }
    }
  }
}
