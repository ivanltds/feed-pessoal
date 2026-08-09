import { openai } from '@/lib/openai'

export interface EnrichedImageResult {
  imageUrl: string
  isAiSelectedImage: boolean
  relevanceScore: 'HIGH' | 'MEDIUM' | 'LOW'
  reason?: string
}

// Dicionário de fotos HD de alta relevância fática por categoria (Unsplash Fallback)
const CATEGORY_FALLBACK_PHOTOS: Record<string, string> = {
  'Dev & Programação': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
  'Desenvolvimento de Software': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
  'Inteligência Artificial': 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200&q=80',
  'Tecnologia': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
  'Economia': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80',
  'Mercado Financeiro': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80',
  'Geopolítica': 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&q=80',
  'Relações Internacionais': 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&q=80',
  'Futebol': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80',
  'Esportes': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=80',
  'Cinema & Séries': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
  'Cultura': 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80',
  'Astronomia': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
  'Ciência': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=80',
  'Brasil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=80',
  'Mundo': 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&q=80',
}

const DEFAULT_EDITORIAL_PHOTO = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80'

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

export function getCategoryFallbackPhoto(topic?: string): string {
  if (!topic) return DEFAULT_EDITORIAL_PHOTO
  return CATEGORY_FALLBACK_PHOTOS[topic] ?? DEFAULT_EDITORIAL_PHOTO
}
