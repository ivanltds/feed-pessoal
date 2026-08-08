import type { RssSource } from './rss/rss-adapter'
import { TOPIC_GROUPS } from '@/domain/news/types'

export const ACTIVE_SOURCES: RssSource[] = [
  // Tecnologia & Inovação
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', topic: 'Tecnologia' },
  { id: 'the-verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', topic: 'Tecnologia' },
  { id: 'mit-tech-review', name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', topic: 'Inteligência Artificial' },
  { id: 'venturebeat-ai', name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', topic: 'Inteligência Artificial' },
  { id: 'exame-startups', name: 'Exame Startups', url: 'https://exame.com/noticias-sobre/startups/feed/', topic: 'Startups & Inovação' },
  { id: 'tabnews', name: 'TabNews', url: 'https://www.tabnews.com.br/contents/rss', topic: 'Dev & Programação' },
  { id: 'devto', name: 'DEV Community', url: 'https://dev.to/feed', topic: 'Dev & Programação' },
  { id: 'thehack', name: 'The Hack', url: 'https://thehack.com.br/feed/', topic: 'Cybersecurity' },
  { id: 'cointelegraph-br', name: 'Cointelegraph Brasil', url: 'https://br.cointelegraph.com/rss', topic: 'Cripto & Web3' },
  { id: 'ign-brasil', name: 'IGN Brasil', url: 'https://br.ign.com/feed.xml', topic: 'Games & Esports' },
  { id: 'kdnuggets', name: 'KDnuggets', url: 'https://www.kdnuggets.com/feed', topic: 'Machine Learning & Dados' },
  { id: 'anandtech', name: 'AnandTech', url: 'https://www.anandtech.com/rss/', topic: 'Hardware & Gadgets' },

  // Economia & Negócios
  { id: 'g1-economia', name: 'G1 Economia', url: 'https://g1.globo.com/rss/g1/economia/', topic: 'Economia' },
  { id: 'infomoney', name: 'InfoMoney', url: 'https://www.infomoney.com.br/feed/', topic: 'Economia' },
  { id: 'valor-economico', name: 'Valor Econômico', url: 'https://valor.globo.com/rss/valor/', topic: 'Mercado Financeiro' },
  { id: 'exame-invest', name: 'Exame Invest', url: 'https://exame.com/invest/feed/', topic: 'Finanças Pessoais' },
  { id: 'exame-negocios', name: 'Exame Negócios', url: 'https://exame.com/negocios/feed/', topic: 'Negócios' },

  // Brasil & Política
  { id: 'agencia-brasil', name: 'Agência Brasil', url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', topic: 'Brasil' },
  { id: 'g1-brasil', name: 'G1 Brasil', url: 'https://g1.globo.com/rss/g1/brasil/', topic: 'Brasil' },
  { id: 'g1-politica', name: 'G1 Política', url: 'https://g1.globo.com/rss/g1/politica/', topic: 'Política Nacional' },

  // Mundo & Geopolítica
  { id: 'bbc-mundo', name: 'BBC Brasil', url: 'https://feeds.bbci.co.uk/portuguese/rss.xml', topic: 'Mundo' },
  { id: 'reuters-world', name: 'Reuters World', url: 'https://feeds.reuters.com/Reuters/worldNews', topic: 'Mundo' },
  { id: 'foreign-affairs', name: 'Foreign Affairs', url: 'https://www.foreignaffairs.com/rss.xml', topic: 'Geopolítica' },
  { id: 'the-economist', name: 'The Economist', url: 'https://www.economist.com/international/rss.xml', topic: 'Geopolítica' },

  // Ciência & Saúde
  { id: 'science-daily', name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', topic: 'Ciência' },
  { id: 'nasa-news', name: 'NASA Breaking News', url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss', topic: 'Astronomia & Espaço' },
  { id: 'spacecom', name: 'Space.com', url: 'https://www.space.com/feeds/all', topic: 'Astronomia & Espaço' },
  { id: 'minha-vida', name: 'Minha Vida Saúde', url: 'https://www.minhavida.com.br/rss', topic: 'Saúde & Medicina' },
  { id: 'g1-natureza', name: 'G1 Natureza', url: 'https://g1.globo.com/rss/g1/natureza/', topic: 'Meio Ambiente & Clima' },

  // Cultura & Entretenimento
  { id: 'the-atlantic', name: 'The Atlantic', url: 'https://www.theatlantic.com/feed/all/', topic: 'Cultura' },
  { id: 'omelete', name: 'Omelete', url: 'https://www.omelete.com.br/rss/', topic: 'Cinema & Séries' },
  { id: 'tenho-mais-discos', name: 'Tenho Mais Discos Q Amigos', url: 'https://www.tenhomaisdiscosqueamigos.com/feed/', topic: 'Música' },
  { id: 'publishnews', name: 'PublishNews', url: 'https://www.publishnews.com.br/rss', topic: 'Livros & Literatura' },
  { id: 'nexo-jornal', name: 'Nexo Jornal', url: 'https://www.nexojornal.com.br/feed', topic: 'Filosofia & Sociedade' },

  // Esportes
  { id: 'trivela', name: 'Trivela', url: 'https://trivela.com.br/feed/', topic: 'Futebol' },
  { id: 'cnnbrasil-esportes', name: 'CNN Brasil Esportes', url: 'https://www.cnnbrasil.com.br/esportes/feed/', topic: 'Esportes' },
  { id: 'ge-globo', name: 'GE Globo Esportes', url: 'https://ge.globo.com/rss/ge/', topic: 'Esportes' },
  { id: 'grande-premio', name: 'Grande Prêmio F1', url: 'https://www.grandepremio.com.br/feed/', topic: 'Automobilismo & F1' },

  // Estilo de Vida
  { id: 'hbr-br', name: 'Harvard Business Review', url: 'https://hbr.org/feed', topic: 'Produtividade & Carreira' },
  { id: 'paladar-estadao', name: 'Paladar Estadão', url: 'https://www.estadao.com.br/rss/paladar/', topic: 'Gastronomia' },
  { id: 'viagem-turismo', name: 'Viagem e Turismo', url: 'https://viageme-turismo.abril.com.br/feed/', topic: 'Viagens' },
]

export function getSourcesByTopics(topics: string[]): RssSource[] {
  if (!topics || topics.length === 0) return ACTIVE_SOURCES

  const matchedSources: RssSource[] = []

  for (const topic of topics) {
    // 1. Tenta encontrar fontes diretamente atribuídas a este tópico
    const directMatches = ACTIVE_SOURCES.filter((s) => s.topic === topic)
    if (directMatches.length > 0) {
      matchedSources.push(...directMatches)
      continue
    }

    // 2. Fallback inteligente: Encontra o grupo do tópico e usa fontes do mesmo grupo
    const group = TOPIC_GROUPS.find((g) => g.topics.includes(topic))
    if (group) {
      const groupSources = ACTIVE_SOURCES.filter((s) => group.topics.includes(s.topic))
      if (groupSources.length > 0) {
        // Atribui dinamicamente ao tópico solicitado
        matchedSources.push(
          ...groupSources.map((s) => ({
            ...s,
            topic: topic
          }))
        )
        continue
      }
    }

    // 3. Fallback geral
    const defaultSource = ACTIVE_SOURCES[matchedSources.length % ACTIVE_SOURCES.length]
    if (defaultSource) {
      matchedSources.push({
        ...defaultSource,
        topic: topic
      })
    }
  }

  // Remove duplicados pelo ID da fonte
  const uniqueSources: RssSource[] = []
  const seenIds = new Set<string>()

  for (const s of matchedSources) {
    const key = `${s.id}-${s.topic}`
    if (!seenIds.has(key)) {
      seenIds.add(key)
      uniqueSources.push(s)
    }
  }

  return uniqueSources.length > 0 ? uniqueSources : ACTIVE_SOURCES
}
