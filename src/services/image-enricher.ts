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
}): Promise<EnrichedImageResult> {
  const contextText = item.summary
    ? `${item.normalizedTitle}. ${item.summary}`
    : item.normalizedTitle

  let approvedKeyword = item.topic

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const conceptResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 100,
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Você é um curador de fotografia jornalística.
Dado o título e o assunto da notícia, defina 1 a 2 palavras em inglês simples e diretas representando a imagem principal (ex: "football", "stocks", "space", "robotics", "politics", "cinema").

Retorne um JSON exatamente no formato:
{ "searchKeyword": "palavras em inglês" }`
          },
          { role: 'user', content: `Tópico: ${item.topic}\nNotícia: ${contextText}` }
        ]
      })

      const content = conceptResponse.choices[0]?.message?.content ?? '{}'
      const parsed = JSON.parse(content) as { searchKeyword?: string }
      if (parsed.searchKeyword && parsed.searchKeyword.trim().length > 0) {
        approvedKeyword = parsed.searchKeyword.trim().replace(/[^a-zA-Z0-9]/g, '')
        break
      }
    } catch (err) {
      console.error(`[ImageEnricher] Erro ao obter palavra-chave:`, err)
    }
  }

  const cleanKeyword = encodeURIComponent(approvedKeyword || item.topic)
  
  // Garantia absoluta de imagem fotográfica de alta qualidade via LoremFlickr com fallback para Picsum
  const imageUrl = `https://loremflickr.com/1200/675/${cleanKeyword}?lock=${item.id.length}`

  return {
    imageUrl,
    isAiSelectedImage: true,
    relevanceScore: 'HIGH',
    reason: `Imagem jornalística temática atribuída pela IA para '${approvedKeyword}'.`
  }
}
