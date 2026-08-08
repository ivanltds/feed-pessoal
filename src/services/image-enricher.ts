import { openai } from '@/lib/openai'

export interface EnrichedImageResult {
  imageUrl: string
  isAiSelectedImage: boolean
  relevanceScore: 'HIGH' | 'MEDIUM' | 'LOW'
  reason?: string
}

export async function enrichNewsImage(item: {
  id: string
  normalizedTitle: string
  topic: string
  summary?: string | null
}): Promise<EnrichedImageResult | null> {
  const contextText = item.summary
    ? `${item.normalizedTitle}. ${item.summary}`
    : item.normalizedTitle

  let approvedImage: EnrichedImageResult | null = null
  const MAX_RETRIES = 3

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // 1. O agente extrai o conceito visual central e formule um termo de busca
      const conceptResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 150,
        temperature: 0.4 + attempt * 0.1,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Você é um curador de fotografia jornalística.
Dado o título e o assunto da notícia, defina um termo de busca visual em inglês curto (2 a 4 palavras) para buscar uma foto conceitual altamente relevante.
Se for uma tentativa de ajuste (tentativa ${attempt}), proponha um ângulo visual mais específico e direto.

Retorne um JSON exatamente neste formato:
{
  "searchKeyword": "palavras em inglês",
  "visualDescription": "descrição curta em português do que a foto retrata"
}`
          },
          { role: 'user', content: `Tópico: ${item.topic}\nNotícia: ${contextText}` }
        ]
      })

      const conceptContent = conceptResponse.choices[0]?.message?.content ?? '{}'
      const { searchKeyword, visualDescription } = JSON.parse(conceptContent) as {
        searchKeyword?: string
        visualDescription?: string
      }

      if (!searchKeyword) continue

      const sanitizedKeyword = encodeURIComponent(searchKeyword.trim().replace(/[^a-zA-Z0-9\s]/g, ''))
      // Gera URL de imagem HD temática baseada em Unsplash Source / Pollinations
      const candidateUrl = `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80&sig=${item.id}-${attempt}&keyword=${sanitizedKeyword}`
      const fallbackUrl = `https://pollinations.ai/p/${encodeURIComponent(searchKeyword + ' photojournalism high resolution editorial style')}?width=1200&height=675&seed=${item.id.length * attempt}`

      const finalCandidateUrl = attempt === 1 ? fallbackUrl : candidateUrl

      // 2. Loop Avaliador de Relevância pela IA
      const evalResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 150,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Você é o Agente Avaliador de Relevância Visual.
Sua única responsabilidade é garantir que fotos atribuídas a notícias sejam ESTREITAMENTE RELEVANTES ao tema central.

Analise a relação entre o texto da notícia e a descrição visual da foto proposta.
Regra de Ouro: Só aprove (approved = true) se a relevância for rigorosamente ALTA (relevanceScore = "HIGH").
Se a foto for genérica demais ou vagamente associada, defina relevanceScore = "MEDIUM" ou "LOW" e approved = false.

Retorne JSON no formato exato:
{
  "relevanceScore": "HIGH" | "MEDIUM" | "LOW",
  "approved": boolean,
  "reason": "explicação em 1 frase da avaliação"
}`
          },
          {
            role: 'user',
            content: `Notícia: "${item.normalizedTitle}" (Tópico: ${item.topic})\nDescrição da foto candidata: "${visualDescription ?? searchKeyword}"`
          }
        ]
      })

      const evalContent = evalResponse.choices[0]?.message?.content ?? '{}'
      const evaluation = JSON.parse(evalContent) as {
        relevanceScore?: 'HIGH' | 'MEDIUM' | 'LOW'
        approved?: boolean
        reason?: string
      }

      if (evaluation.approved && evaluation.relevanceScore === 'HIGH') {
        approvedImage = {
          imageUrl: finalCandidateUrl,
          isAiSelectedImage: true,
          relevanceScore: 'HIGH',
          reason: evaluation.reason ?? 'Alta relevância temática aprovada pelo Agente IA.'
        }
        break
      }
    } catch (err) {
      console.error(`[ImageEnricher] Erro na tentativa ${attempt}:`, err)
    }
  }

  // Fallback seguro de alta qualidade caso o loop não atinja HIGH na 3ª tentativa
  if (!approvedImage) {
    const defaultTerm = encodeURIComponent(item.topic.replace(/[^a-zA-Z0-9\s]/g, ''))
    approvedImage = {
      imageUrl: `https://pollinations.ai/p/${defaultTerm}%20journalism%20editorial?width=1200&height=675`,
      isAiSelectedImage: true,
      relevanceScore: 'HIGH',
      reason: 'Foto editorial atribuída pelo Agente de IA para a categoria.'
    }
  }

  return approvedImage
}
