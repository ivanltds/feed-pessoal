import type { RssSource } from './rss/rss-adapter'
import { TOPIC_GROUPS } from '@/domain/news/types'

export type SourceRegion = 'OCIDENTAL' | 'ORIENTE_MEDIO' | 'ASIA_PACIFICO' | 'SUL_GLOBAL'

export const ACTIVE_SOURCES: RssSource[] = [
  // FONTES INTERNACIONAIS NÃO-OCIDENTAIS & SUL GLOBAL (PLURALISMO DESCENTRALIZADO)
  { id: 'al-jazeera', name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', topic: 'Geopolítica', region: 'ORIENTE_MEDIO' },
  { id: 'scmp-world', name: 'South China Morning Post', url: 'https://www.scmp.com/rss/91/feed', topic: 'Geopolítica', region: 'ASIA_PACIFICO' },
  { id: 'nikkei-asia', name: 'Nikkei Asia', url: 'https://asia.nikkei.com/rss/feed/nar', topic: 'Economia', region: 'ASIA_PACIFICO' },
  { id: 'ips-news', name: 'Inter Press Service', url: 'https://www.ipsnews.net/feed/', topic: 'Mundo', region: 'SUL_GLOBAL' },
  { id: 'africanews', name: 'Africanews', url: 'https://www.africanews.com/feed/', topic: 'Mundo', region: 'SUL_GLOBAL' },
  { id: 'agencia-publica', name: 'Agência Pública', url: 'https://apublica.org/feed/', topic: 'Brasil', region: 'SUL_GLOBAL' },

  // Tecnologia & Inovação
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', topic: 'Tecnologia', region: 'OCIDENTAL' },
  { id: 'the-verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', topic: 'Tecnologia', region: 'OCIDENTAL' },
  { id: 'mit-tech-review', name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', topic: 'Inteligência Artificial', region: 'OCIDENTAL' },
  { id: 'venturebeat-ai', name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', topic: 'Inteligência Artificial', region: 'OCIDENTAL' },
  { id: 'exame-startups', name: 'Exame Startups', url: 'https://exame.com/noticias-sobre/startups/feed/', topic: 'Startups & Inovação', region: 'SUL_GLOBAL' },
  { id: 'tabnews', name: 'TabNews', url: 'https://www.tabnews.com.br/contents/rss', topic: 'Dev & Programação', region: 'SUL_GLOBAL' },
  { id: 'devto', name: 'DEV Community', url: 'https://dev.to/feed', topic: 'Dev & Programação', region: 'OCIDENTAL' },
  { id: 'thehack', name: 'The Hack', url: 'https://thehack.com.br/feed/', topic: 'Cybersecurity', region: 'SUL_GLOBAL' },
  { id: 'cointelegraph-br', name: 'Cointelegraph Brasil', url: 'https://br.cointelegraph.com/rss', topic: 'Cripto & Web3', region: 'SUL_GLOBAL' },
  { id: 'ign-brasil', name: 'IGN Brasil', url: 'https://br.ign.com/feed.xml', topic: 'Games & Esports', region: 'SUL_GLOBAL' },
  { id: 'kdnuggets', name: 'KDnuggets', url: 'https://www.kdnuggets.com/feed', topic: 'Machine Learning & Dados', region: 'OCIDENTAL' },
  { id: 'anandtech', name: 'AnandTech', url: 'https://www.anandtech.com/rss/', topic: 'Hardware & Gadgets', region: 'OCIDENTAL' },

  // Economia & Negócios
  { id: 'g1-economia', name: 'G1 Economia', url: 'https://g1.globo.com/rss/g1/economia/', topic: 'Economia', region: 'SUL_GLOBAL' },
  { id: 'infomoney', name: 'InfoMoney', url: 'https://www.infomoney.com.br/feed/', topic: 'Economia', region: 'SUL_GLOBAL' },
  { id: 'valor-economico', name: 'Valor Econômico', url: 'https://valor.globo.com/rss/valor/', topic: 'Mercado Financeiro', region: 'SUL_GLOBAL' },
  { id: 'exame-invest', name: 'Exame Invest', url: 'https://exame.com/invest/feed/', topic: 'Finanças Pessoais', region: 'SUL_GLOBAL' },
  { id: 'exame-negocios', name: 'Exame Negócios', url: 'https://exame.com/negocios/feed/', topic: 'Negócios', region: 'SUL_GLOBAL' },

  // Brasil & Política
  { id: 'agencia-brasil', name: 'Agência Brasil', url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', topic: 'Brasil', region: 'SUL_GLOBAL' },
  { id: 'g1-brasil', name: 'G1 Brasil', url: 'https://g1.globo.com/rss/g1/brasil/', topic: 'Brasil', region: 'SUL_GLOBAL' },
  { id: 'g1-politica', name: 'G1 Política', url: 'https://g1.globo.com/rss/g1/politica/', topic: 'Política Nacional', region: 'SUL_GLOBAL' },

  // Mundo & Geopolítica
  { id: 'bbc-mundo', name: 'BBC Brasil', url: 'https://feeds.bbci.co.uk/portuguese/rss.xml', topic: 'Mundo', region: 'OCIDENTAL' },
  { id: 'reuters-world', name: 'Reuters World', url: 'https://feeds.reuters.com/Reuters/worldNews', topic: 'Mundo', region: 'OCIDENTAL' },
  { id: 'foreign-affairs', name: 'Foreign Affairs', url: 'https://www.foreignaffairs.com/rss.xml', topic: 'Geopolítica', region: 'OCIDENTAL' },
  { id: 'the-economist', name: 'The Economist', url: 'https://www.economist.com/international/rss.xml', topic: 'Geopolítica', region: 'OCIDENTAL' },

  // Ciência & Saúde
  { id: 'science-daily', name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', topic: 'Ciência', region: 'OCIDENTAL' },
  { id: 'nasa-news', name: 'NASA Breaking News', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', topic: 'Astronomia & Espaço', region: 'OCIDENTAL' },
  { id: 'spacecom', name: 'Space.com', url: 'https://www.space.com/feeds/all', topic: 'Astronomia & Espaço', region: 'OCIDENTAL' },
  { id: 'minha-vida', name: 'Minha Vida Saúde', url: 'https://www.minhavida.com.br/rss', topic: 'Saúde & Medicina', region: 'SUL_GLOBAL' },
  { id: 'g1-natureza', name: 'G1 Natureza', url: 'https://g1.globo.com/rss/g1/natureza/', topic: 'Meio Ambiente & Clima', region: 'SUL_GLOBAL' },

  // Cultura & Entretenimento
  { id: 'the-atlantic', name: 'The Atlantic', url: 'https://www.theatlantic.com/feed/all/', topic: 'Cultura', region: 'OCIDENTAL' },
  { id: 'omelete', name: 'Omelete', url: 'https://www.omelete.com.br/rss/', topic: 'Cinema & Séries', region: 'SUL_GLOBAL' },
  { id: 'tenho-mais-discos', name: 'Tenho Mais Discos Q Amigos', url: 'https://www.tenhomaisdiscosqueamigos.com/feed/', topic: 'Música', region: 'SUL_GLOBAL' },
  { id: 'publishnews', name: 'PublishNews', url: 'https://www.publishnews.com.br/rss', topic: 'Livros & Literatura', region: 'SUL_GLOBAL' },
  { id: 'nexo-jornal', name: 'Nexo Jornal', url: 'https://www.nexojornal.com.br/feed', topic: 'Filosofia & Sociedade', region: 'SUL_GLOBAL' },

  // Esportes
  { id: 'trivela', name: 'Trivela', url: 'https://trivela.com.br/feed/', topic: 'Futebol', region: 'SUL_GLOBAL' },
  { id: 'cnnbrasil-esportes', name: 'CNN Brasil Esportes', url: 'https://www.cnnbrasil.com.br/esportes/feed/', topic: 'Esportes', region: 'SUL_GLOBAL' },
  { id: 'ge-globo', name: 'GE Globo Esportes', url: 'https://ge.globo.com/rss/ge/', topic: 'Esportes', region: 'SUL_GLOBAL' },
  { id: 'grande-premio', name: 'Grande Prêmio F1', url: 'https://www.grandepremio.com.br/feed/', topic: 'Automobilismo & F1', region: 'SUL_GLOBAL' },

  // Estilo de Vida
  { id: 'hbr-br', name: 'Harvard Business Review', url: 'https://hbr.org/feed', topic: 'Produtividade & Carreira', region: 'OCIDENTAL' },
  { id: 'paladar-estadao', name: 'Paladar Estadão', url: 'https://www.estadao.com.br/rss/paladar/', topic: 'Gastronomia', region: 'SUL_GLOBAL' },
  { id: 'viagem-turismo', name: 'Viagem e Turismo', url: 'https://viageme-turismo.abril.com.br/feed/', topic: 'Viagens', region: 'SUL_GLOBAL' },
]

export function getSourcesByTopics(topics: string[]): RssSource[] {
  if (!topics || topics.length === 0) return ACTIVE_SOURCES

  const matchedSources: RssSource[] = []

  for (const topic of topics) {
    // 1. Fontes diretamente associadas
    const directMatches = ACTIVE_SOURCES.filter((s) => s.topic === topic)
    if (directMatches.length > 0) {
      matchedSources.push(...directMatches)
      continue
    }

    // 2. Fontes do mesmo grupo temático
    const group = TOPIC_GROUPS.find((g) => g.topics.includes(topic))
    if (group) {
      const groupSources = ACTIVE_SOURCES.filter((s) => group.topics.includes(s.topic))
      if (groupSources.length > 0) {
        matchedSources.push(...groupSources)
        continue
      }
    }

    // 3. Fallback geral
    const defaultSource = ACTIVE_SOURCES[matchedSources.length % ACTIVE_SOURCES.length]
    if (defaultSource) {
      matchedSources.push(defaultSource)
    }
  }

  // Garantia Rígida: Sempre incluir fontes internacionais não-ocidentais se tópicos globais forem selecionados
  const nonWesternGlobalSources = ACTIVE_SOURCES.filter(
    (s) => s.region === 'ORIENTE_MEDIO' || s.region === 'ASIA_PACIFICO' || s.region === 'SUL_GLOBAL'
  )
  matchedSources.push(...nonWesternGlobalSources.slice(0, 4))

  // Remove duplicados pelo ID da fonte
  const uniqueSources: RssSource[] = []
  const seenIds = new Set<string>()

  for (const s of matchedSources) {
    if (!seenIds.has(s.id)) {
      seenIds.add(s.id)
      uniqueSources.push(s)
    }
  }

  return uniqueSources.length > 0 ? uniqueSources : ACTIVE_SOURCES
}

export function formatRegionLabel(region?: string): string {
  switch (region) {
    case 'ORIENTE_MEDIO':
      return 'ORIENTE MÉDIO'
    case 'ASIA_PACIFICO':
      return 'ÁSIA-PACÍFICO'
    case 'SUL_GLOBAL':
      return 'SUL GLOBAL'
    case 'OCIDENTAL':
    default:
      return 'OCIDENTAL'
  }
}
