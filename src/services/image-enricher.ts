import { openai } from '@/lib/openai'
import { getCategoryFallbackPhoto } from '@/lib/category-photos'

export { getCategoryFallbackPhoto }

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

  let photoPrompt = `High resolution editorial photograph representing ${item.topic}: ${item.normalizedTitle}, professional news photography, no text`

  try {
    const conceptResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 120,
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você é um diretor de fotografia jornalística.
Dado o título e o resumo da notícia, formule uma descrição fotográfica em inglês muito precisa e realista (sem gatos ou animais aleatórios a menos que a notícia seja sobre animais).

Exemplo para "MCP em 2026: protocolo de IA":
"High resolution editorial photograph of software developers working on artificial intelligence code and data network interfaces, professional news photography, no text"

Retorne JSON no formato:
{ "photoPrompt": "descrição fotográfica em inglês" }`
        },
        { role: 'user', content: `Tópico: ${item.topic}\nNotícia: ${contextText}` }
      ]
    })

    const content = conceptResponse.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content) as { photoPrompt?: string }
    if (parsed.photoPrompt && parsed.photoPrompt.trim().length > 5) {
      photoPrompt = parsed.photoPrompt.trim()
    }
  } catch (err) {
    console.error(`[ImageEnricher] Erro ao obter prompt fotográfico:`, err)
  }

  // Gera a imagem fotográfica 100% relevante via Pollinations AI Engine
  const seed = Array.from(item.id).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(photoPrompt)}?width=1200&height=675&nologo=true&seed=${seed}`

  return {
    imageUrl,
    isAiSelectedImage: true,
    relevanceScore: 'HIGH',
    reason: `Fotografia jornalística por IA: '${photoPrompt}'.`
  }
}
