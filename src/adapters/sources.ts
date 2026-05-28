import type { RssSource } from './rss/rss-adapter'

/**
 * Registry de fontes ativas.
 * Para adicionar uma nova fonte: crie um objeto RssSource e adicione ao array.
 * Para remover/desativar: comente ou remova a entrada. Sem refatoração necessária.
 */
export const ACTIVE_SOURCES: RssSource[] = [
  // Brasil
  { id: 'agencia-brasil', name: 'Agência Brasil', url: 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml', topic: 'Brasil' },
  { id: 'g1-brasil', name: 'G1 Brasil', url: 'https://g1.globo.com/rss/g1/brasil/', topic: 'Brasil' },

  // Mundo
  { id: 'bbc-mundo', name: 'BBC Brasil', url: 'https://feeds.bbci.co.uk/portuguese/rss.xml', topic: 'Mundo' },
  { id: 'reuters-world', name: 'Reuters', url: 'https://feeds.reuters.com/Reuters/worldNews', topic: 'Mundo' },

  // Tecnologia
  { id: 'techcrunch', name: 'TechCrunch', url: 'https://techcrunch.com/feed/', topic: 'Tecnologia' },
  { id: 'the-verge', name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', topic: 'Tecnologia' },

  // Economia
  { id: 'g1-economia', name: 'G1 Economia', url: 'https://g1.globo.com/rss/g1/economia/', topic: 'Economia' },
  { id: 'infomoney', name: 'InfoMoney', url: 'https://www.infomoney.com.br/feed/', topic: 'Economia' },

  // Ciência
  { id: 'mit-tech-review', name: 'MIT Tech Review', url: 'https://www.technologyreview.com/feed/', topic: 'Ciência' },
  { id: 'science-daily', name: 'Science Daily', url: 'https://www.sciencedaily.com/rss/all.xml', topic: 'Ciência' },

  // Geopolítica
  { id: 'foreign-affairs', name: 'Foreign Affairs', url: 'https://www.foreignaffairs.com/rss.xml', topic: 'Geopolítica' },
  { id: 'the-economist', name: 'The Economist', url: 'https://www.economist.com/international/rss.xml', topic: 'Geopolítica' },

  // Cultura
  { id: 'the-atlantic', name: 'The Atlantic', url: 'https://www.theatlantic.com/feed/all/', topic: 'Cultura' },

  // Esportes
  { id: 'trivela', name: 'Trivela', url: 'https://trivela.com.br/feed/', topic: 'Esportes' },
  { id: 'cnnbrasil-esportes', name: 'CNN Brasil Esportes', url: 'https://www.cnnbrasil.com.br/esportes/feed/', topic: 'Esportes' },
]

export function getSourcesByTopics(topics: string[]): RssSource[] {
  return ACTIVE_SOURCES.filter((s) => topics.includes(s.topic))
}
