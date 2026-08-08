import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockItem = {
  id: 'item-1',
  topic: 'Tecnologia',
  normalizedTitle: 'Título Normalizado',
  summary: 'Resumo do artigo',
}

vi.mock('@/lib/prisma', () => ({
  prisma: {
    newsItem: {
      findUnique: vi.fn().mockResolvedValue(mockItem),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ language: 'pt-BR' }),
    },
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'user-123' }),
  }),
}))

const mockQuestions = [
  { id: 'q1', newsItemId: 'item-1', topic: 'Tecnologia', text: 'Pergunta 1?' },
  { id: 'q2', newsItemId: 'item-1', topic: 'Tecnologia', text: 'Pergunta 2?' },
  { id: 'q3', newsItemId: 'item-1', topic: 'Tecnologia', text: 'Pergunta 3?' },
]

vi.mock('@/services/question-generator', () => ({
  generateSuggestedQuestions: vi.fn().mockResolvedValue(mockQuestions),
}))

const { POST } = await import('./route')
const { prisma } = await import('@/lib/prisma')

function makeRequest(body: object) {
  return new Request('http://localhost/api/questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/questions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna lista vazia se newsItem não encontrado', async () => {
    vi.mocked(prisma.newsItem.findUnique).mockResolvedValue(null)
    const res = await POST(makeRequest({ newsItemId: 'nao-existe' }) as any)
    const body = await res.json()
    expect(body.questions).toEqual([])
  })

  it('retorna 3 perguntas no caminho feliz', async () => {
    vi.mocked(prisma.newsItem.findUnique).mockResolvedValue(mockItem as any)
    const res = await POST(makeRequest({ newsItemId: 'item-1' }) as any)
    const body = await res.json()
    expect(body.questions).toHaveLength(3)
  })

  it('cada pergunta tem text, topic e newsItemId', async () => {
    vi.mocked(prisma.newsItem.findUnique).mockResolvedValue(mockItem as any)
    const res = await POST(makeRequest({ newsItemId: 'item-1' }) as any)
    const { questions } = await res.json()
    for (const q of questions) {
      expect(q).toHaveProperty('text')
      expect(q).toHaveProperty('topic')
      expect(q).toHaveProperty('newsItemId')
    }
  })
})
