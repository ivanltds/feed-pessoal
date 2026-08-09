import { openai } from '@/lib/openai'
import { SUPPORTED_LANGUAGES } from './summary-generator'
import { isProbablyEnglish, translateSingleTitle } from './title-normalizer'

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

function buildFactualFallbackPerspectives(title: string, topic: string): NewsPerspective[] {
  const cleanTitle = title.replace(/^["']|["']$/g, '')
  return [
    {
      type: 'impact',
      badge: 'Impacto Prático',
      title: 'Efeitos Diretos nas Comunidades',
      summary: `Os acontecimentos em torno de "${cleanTitle}" geram impacto imediato na rotina das populações locais, exigindo respostas rápidas das autoridades e mobilização de recursos de proteção e suporte.`
    },
    {
      type: 'counterpoint',
      badge: 'Contraponto & Riscos',
      title: 'Dilemas e Questionamentos Críticos',
      summary: `Especialistas e grupos da sociedade civil cobram maior transparência nas investigações sobre "${cleanTitle}", ressaltando falhas de prevenção e lacunas em protocolos de segurança.`
    },
    {
      type: 'global_south',
      badge: 'Sul Global & Emergentes',
      title: 'Visão de Países Emergentes',
      summary: `O episódio mobiliza atenção na Ásia, África e América Latina, reacendendo debates sobre políticas públicas, segurança comunitária e estabilidade social em ${topic}.`
    },
    {
      type: 'outlook',
      badge: 'Próximos Passos',
      title: 'Desdobramentos e Ações Oficiais',
      summary: `Autoridades responsáveis devem emitir novos relatórios oficiais e encaminhar deliberações administrativas e regulatórias no curto e médio prazo sobre os desdobramentos de "${cleanTitle}".`
    }
  ]
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

  let cleanTitle = item.normalizedTitle
  if (isProbablyEnglish(cleanTitle)) {
    cleanTitle = await translateSingleTitle(cleanTitle, language)
  }

  const context = item.summary
    ? `Título da Notícia (em Português): ${cleanTitle}\nResumo Informativo: ${item.summary}`
    : `Título da Notícia (em Português): ${cleanTitle}`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 900,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um analista sênior de inteligência de notícias e geopolítica global.
Analise a notícia fornecida e gere EXATAMENTE 4 perspectivas analíticas sem emojis em ${langName}.

REGRAS RÍGIDAS DE ANÁLISE INFORMATIVA:
1. NUNCA use jargões corporativos genéricos ("afetando empresas e profissionais envolvidos no setor").
2. Escreva análises específicas em 2 a 3 frases focadas no tema real da notícia (ex: segurança pública, geopolítica, tecnologia, economia).
3. Garanta que todos os títulos e resumos estejam 100% traduzidos para ${langName}.

Retorne um JSON válido com o formato exato:
{
  "perspectives": [
    {
      "type": "impact",
      "badge": "Impacto Prático",
      "title": "Título sobre quem é afetado",
      "summary": "Análise clara em 2-3 frases sobre o impacto real nas partes envolvidas."
    },
    {
      "type": "counterpoint",
      "badge": "Contraponto & Riscos",
      "title": "Título sobre críticas e controvérsias",
      "summary": "Análise clara em 2-3 frases sobre questionamentos e dilemas do episódio."
    },
    {
      "type": "global_south",
      "badge": "Sul Global & Emergentes",
      "title": "Repercussão em Países Emergentes",
      "summary": "Análise factual de como o fato afeta a Ásia, África e América Latina fora do eixo ocidental."
    },
    {
      "type": "outlook",
      "badge": "Próximos Passos",
      "title": "Título sobre desdobramentos futuros",
      "summary": "Análise clara em 2-3 frases sobre o que esperar das autoridades e investigações."
    }
  ]
}`
        },
        { role: 'user', content: context }
      ]
    })

    const content = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content) as { perspectives?: NewsPerspective[] }

    if (parsed.perspectives && parsed.perspectives.length === 4) {
      return {
        newsItemId: item.id,
        perspectives: parsed.perspectives
      }
    }
  } catch (error) {
    console.error('[PerspectiveGenerator] Erro ao gerar perspectivas:', error)
  }

  return {
    newsItemId: item.id,
    perspectives: buildFactualFallbackPerspectives(cleanTitle, item.topic)
  }
}
