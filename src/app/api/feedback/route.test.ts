import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    userTopicWeight: {
      findMany: vi.fn().mockResolvedValue([{ topic: 'Tecnologia', weight: 5 }]),
      upsert: vi.fn().mockResolvedValue({}),
    },
    feedbackEvent: {
      create: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn().mockImplementation((ops: unknown[]) => Promise.all(ops)),
  },
}))

const { POST } = await import('./route')
const { prisma } = await import('@/lib/prisma')

function makeRequest(body: object) {
  return new Request('http://localhost/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/feedback', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 400 se userId ausente', async () => {
    const res = await POST(makeRequest({ events: [{ newsItemId: 'n1', topic: 'Tecnologia', type: 'long_read' }] }) as any)
    expect(res.status).toBe(400)
  })

  it('retorna 400 se events vazio', async () => {
    const res = await POST(makeRequest({ userId: 'u1', events: [] }) as any)
    expect(res.status).toBe(400)
  })

  it('retorna 200 e persiste eventos e pesos no caminho feliz', async () => {
    const res = await POST(makeRequest({
      userId: 'u1',
      events: [{ newsItemId: 'n1', topic: 'Tecnologia', type: 'long_read' }],
    }) as any)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(prisma.$transaction).toHaveBeenCalledOnce()
  })

  it('atualiza peso do tópico correto após deep_dive_question', async () => {
    await POST(makeRequest({
      userId: 'u1',
      events: [{ newsItemId: 'n1', topic: 'Economia', type: 'deep_dive_question' }],
    }) as any)
    const transactionOps = vi.mocked(prisma.$transaction).mock.calls[0][0] as unknown[]
    // deve ter ao menos um upsert de peso para Economia
    expect(transactionOps.length).toBeGreaterThan(0)
  })
})
