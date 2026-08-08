export const TOPIC_GROUPS: { groupName: string; topics: string[] }[] = [
  {
    groupName: 'Tecnologia & Inovação',
    topics: [
      'Tecnologia',
      'Inteligência Artificial',
      'Startups & Inovação',
      'Dev & Programação',
      'Cybersecurity',
      'Cripto & Web3',
      'Games & Esports',
      'Machine Learning & Dados',
      'Hardware & Gadgets',
      'Computação Quântica',
      'Robótica & Automação',
      'Open Source',
      'Redes & Infraestrutura',
      'Realidade Virtual & AR',
      'Biotecnologia & Bio-Tech',
    ]
  },
  {
    groupName: 'Economia & Negócios',
    topics: [
      'Economia',
      'Mercado Financeiro',
      'Finanças Pessoais',
      'Negócios',
      'Macroeconomia',
      'Renda Fixa & Ações',
      'Venture Capital & M&A',
      'Imóveis & Real Estate',
      'Comércio Exterior & Commodities',
      'Empreendedorismo & PMEs',
      'ESG & Impacto Social',
      'Gestão & Liderança',
    ]
  },
  {
    groupName: 'Brasil & Política',
    topics: [
      'Brasil',
      'Política Nacional',
      'Congresso & Leis',
      'Judiciário & STF',
      'Governos Estaduais',
      'Cidades & Urbanismo',
      'Infraestrutura & Logística',
      'Segurança Pública',
      'Educação Nacional',
      'Previdência & Trabalho',
    ]
  },
  {
    groupName: 'Mundo & Geopolítica',
    topics: [
      'Mundo',
      'Geopolítica',
      'Relações Internacionais',
      'Defesa & Conflitos',
      'América Latina',
      'Estados Unidos & América do Norte',
      'União Europeia & Europa',
      'Ásia-Pacífico & China',
      'Oriente Médio',
      'Organizações Globais & ONU',
    ]
  },
  {
    groupName: 'Ciência & Saúde',
    topics: [
      'Ciência',
      'Astronomia & Espaço',
      'Saúde & Medicina',
      'Meio Ambiente & Clima',
      'Neurociência & Mente',
      'Genética & DNA',
      'Física & Química',
      'Oceanos & Vida Marinha',
      'Nutrição & Longevidade',
      'Infectologia & Saúde Pública',
      'Energias Renováveis',
      'Paleontologia & Arqueologia',
    ]
  },
  {
    groupName: 'Cultura & Entretenimento',
    topics: [
      'Cultura',
      'Cinema & Séries',
      'Música',
      'Livros & Literatura',
      'Filosofia & Sociedade',
      'Artes Visuais & Museus',
      'História & Civilizações',
      'Arquitetura & Design',
      'Fotografia',
      'Teatro & Performance',
      'Podcasting & Mídia',
      'Moda & Design Editorial',
      'Quadrinhos & Animação',
    ]
  },
  {
    groupName: 'Esportes',
    topics: [
      'Esportes',
      'Futebol',
      'Automobilismo & F1',
      'Basquete & NBA',
      'Tênis & Surf',
      'Atletismo & Olimpíadas',
      'Esportes de Combate & UFC',
      'Ciclismo & Aventura',
      'Negócios do Esporte',
      'Futebol Europeu',
      'Futebol Feminino',
    ]
  },
  {
    groupName: 'Estilo de Vida',
    topics: [
      'Produtividade & Carreira',
      'Gastronomia',
      'Viagens',
      'Trabalho Remoto & Nômades',
      'Psicologia & Bem-Estar',
      'Design de Interiores',
      'Vinhos & Cordoaria',
      'Hábitos & Rotina',
      'Aprendizado & Idiomas',
      'Minimalismo & Organização',
      'Cultura Cafeeira & Culinária',
    ]
  }
]

export const TOPICS = TOPIC_GROUPS.flatMap((g) => g.topics)

export type Topic = string

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
  isAiSelectedImage?: boolean
}
