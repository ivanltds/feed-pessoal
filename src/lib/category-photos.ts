// Dicionário de fotos HD de alta relevância fática por categoria (Unsplash Fallback)
// Este arquivo é isolado (zero dependências de LLM/OpenAI) para permitir importação limpa em componentes do cliente ('use client')

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

export function getCategoryFallbackPhoto(topic?: string): string {
  if (!topic) return DEFAULT_EDITORIAL_PHOTO
  return CATEGORY_FALLBACK_PHOTOS[topic] ?? DEFAULT_EDITORIAL_PHOTO
}
