import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildEditionForUser } from './edition-builder'

// ── Mocks ──────────────────────────────────────────────────────────────────
vi.mock('@/lib/prisma', () => ({
  prisma: {
    edition: {
      findUnique: vi.fn(),
      upsert: vi.fn().mockResolvedValue({ id: 'edition-123' }),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ language: 'pt-BR' }),
    },
    userTopicWeight: {
      findMany: vi.fn().mockResolvedValue([
        { topic: 'Tecnologia', weight: 5 },
        { topic: 'Economia', weight: 1 },
      ]),
    },
    pushSubscription: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}))

vi.mock('@/adapters/sources', () => ({
  getSourcesByTopics: vi.fn().mockReturnValue([
    { id: 'src-1', topic: 'Tecnologia', feedUrl: 'https://rss.example.com/tech' },
  ]),
}))

vi.mock('@/adapters/rss/rss-adapter', () => ({
  fetchFromRss: vi.fn().mockResolvedValue([
    {
      sourceId: 'src-1',
      sourceName: 'Tech Blog',
      topic: 'Tecnologia',
      title: 'Raw Article Title',
      url: 'https://example.com/article-1',
      publishedAt: new Date(),
    },
  ]),
}))

vi.mock('./title-normalizer', () => ({
  normalizeTitles: vi.fn().mockResolvedValue(['Título Normalizado']),
}))

vi.mock('./summary-generator', () => ({
  generateSummaries: vi.fn().mockResolvedValue(['Resumo gerado pela IA.']),
}))

// ── testes ─────────────────────────────────────────────────────────────────
const { prisma } = await import('@/lib/prisma')

describe('buildEditionForUser', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { fetchFromRss } = await import('@/adapters/rss/rss-adapter')
    vi.mocked(fetchFromRss).mockResolvedValue([
      {
        sourceId: 'src-1',
        sourceName: 'Tech Blog',
        topic: 'Tecnologia',
        title: 'Raw Article Title',
        url: 'https://example.com/article-1',
        publishedAt: new Date(),
      },
    ])
    // por padrão não há edição existente
    vi.mocked(prisma.edition.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      language: 'pt-BR',
      topicWeights: [{ topic: 'Tecnologia', weight: 5 }]
    } as any)
  })

  it('retorna "already_exists" se já existe edição hoje', async () => {
    vi.mocked(prisma.edition.findUnique).mockResolvedValue({ id: 'existing' } as any)
    const result = await buildEditionForUser('user-123')
    expect(result).toBe('already_exists')
  })

  it('retorna "no_topics" se usuário não tem tópicos configurados', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      language: 'pt-BR',
      topicWeights: []
    } as any)
    const result = await buildEditionForUser('user-123')
    expect(result).toBe('no_topics')
  })

  it('retorna "no_items" se nenhuma notícia foi encontrada', async () => {
    const { fetchFromRss } = await import('@/adapters/rss/rss-adapter')
    vi.mocked(fetchFromRss).mockResolvedValue([])
    const result = await buildEditionForUser('user-123')
    expect(result).toBe('no_items')
  })

  it('retorna "success" e persiste a edição no caminho feliz', async () => {
    const result = await buildEditionForUser('user-123')
    expect(result).toBe('success')
    expect(prisma.edition.upsert).toHaveBeenCalledOnce()
  })

  it('usa tópicos acima de weight > 1.0 como ativos', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      language: 'pt-BR',
      topicWeights: [
        { topic: 'Tecnologia', weight: 5 },
        { topic: 'Economia', weight: 1 }
      ]
    } as any)
    const { getSourcesByTopics } = await import('@/adapters/sources')
    await buildEditionForUser('user-123')
    const calledWith = vi.mocked(getSourcesByTopics).mock.calls[0][0] as string[]
    expect(calledWith).toContain('Tecnologia')
    expect(calledWith).not.toContain('Economia')
  })
})
