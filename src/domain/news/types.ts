export const TOPICS = [
  // Tecnologia & Inovação
  'Tecnologia',
  'Inteligência Artificial',
  'Startups & Inovação',
  'Dev & Programação',
  'Cybersecurity',
  'Cripto & Web3',
  'Games & Esports',

  // Economia & Negócios
  'Economia',
  'Mercado Financeiro',
  'Finanças Pessoais',
  'Negócios',

  // Brasil & Política
  'Brasil',
  'Política Nacional',

  // Mundo & Geopolítica
  'Mundo',
  'Geopolítica',

  // Ciência & Saúde
  'Ciência',
  'Astronomia & Espaço',
  'Saúde & Medicina',
  'Meio Ambiente & Clima',

  // Cultura & Entretenimento
  'Cultura',
  'Cinema & Séries',
  'Música',
  'Livros & Literatura',
  'Filosofia & Sociedade',

  // Esportes
  'Esportes',
  'Futebol',
  'Automobilismo & F1',

  // Estilo de Vida
  'Produtividade & Carreira',
  'Gastronomia',
  'Viagens',
] as const

export type Topic = string

export const TOPIC_GROUPS: { groupName: string; topics: string[] }[] = [
  {
    groupName: '🚀 Tecnologia & Inovação',
    topics: ['Tecnologia', 'Inteligência Artificial', 'Startups & Inovação', 'Dev & Programação', 'Cybersecurity', 'Cripto & Web3', 'Games & Esports']
  },
  {
    groupName: '📈 Economia & Negócios',
    topics: ['Economia', 'Mercado Financeiro', 'Finanças Pessoais', 'Negócios']
  },
  {
    groupName: '🇧🇷 Brasil & Política',
    topics: ['Brasil', 'Política Nacional']
  },
  {
    groupName: '🌐 Mundo & Geopolítica',
    topics: ['Mundo', 'Geopolítica']
  },
  {
    groupName: '🧪 Ciência & Saúde',
    topics: ['Ciência', 'Astronomia & Espaço', 'Saúde & Medicina', 'Meio Ambiente & Clima']
  },
  {
    groupName: '🎨 Cultura & Entretenimento',
    topics: ['Cultura', 'Cinema & Séries', 'Música', 'Livros & Literatura', 'Filosofia & Sociedade']
  },
  {
    groupName: '⚽ Esportes',
    topics: ['Esportes', 'Futebol', 'Automobilismo & F1']
  },
  {
    groupName: '💡 Estilo de Vida',
    topics: ['Produtividade & Carreira', 'Gastronomia', 'Viagens']
  }
]

export interface RawNewsItem {
  sourceId: string
  sourceName: string
  topic: Topic
  title: string
  url: string
  imageUrl?: string
  publishedAt: Date
  summary?: string
}

export interface NewsItem extends RawNewsItem {
  normalizedTitle: string
  score: number
}
