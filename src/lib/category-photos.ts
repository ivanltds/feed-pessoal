// Pool de fotografias HD por categoria para garantir que matérias da mesma área NUNCA tenham fotos idênticas
// Seleção determinística baseada no hash do ID da notícia.

const PHOTO_POOLS: Record<string, string[]> = {
  'Dev & Programação': [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80',
    'https://images.unsplash.com/photo-1537884944318-390069bb8665?w=1200&q=80',
  ],
  'Tecnologia': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
  ],
  'Inteligência Artificial': [
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=1200&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
  ],
  'Economia': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&q=80',
    'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80',
    'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=1200&q=80',
  ],
  'Mercado Financeiro': [
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80',
    'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&q=80',
  ],
  'Geopolítica': [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&q=80',
    'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
  ],
  'Futebol': [
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80',
    'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=1200&q=80',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80',
  ],
  'Cinema & Séries': [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&q=80',
  ],
  'Cultura': [
    'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80',
  ],
  'Música': [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&q=80',
  ],
}

const DEFAULT_POOL = [
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80',
  'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=1200&q=80',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80',
]

function getHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function getCategoryFallbackPhoto(topic?: string, itemId?: string): string {
  const pool = (topic && PHOTO_POOLS[topic]) ? PHOTO_POOLS[topic] : DEFAULT_POOL
  const index = itemId ? getHash(itemId) % pool.length : 0
  return pool[index]
}
