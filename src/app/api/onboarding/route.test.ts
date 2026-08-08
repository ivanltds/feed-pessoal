import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockUser = { id: 'user-abc' }

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn().mockResolvedValue(mockUser),
      upsert: vi.fn().mockResolvedValue(mockUser),
    },
    userTopicWeight: {
      upsert: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn().mockResolvedValue([]),
  },
}))

const { POST } = await import('./route')
const { prisma } = await import('@/lib/prisma')

function makeRequest(body: object) {
  return new Request('http://localhost/api/onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/onboarding', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 400 se topics estiver vazio', async () => {
    const res = await POST(makeRequest({ topics: [], editionHour: 8 }) as any)
    expect(res.status).toBe(400)
  })

  it('cria usuário sem email quando email não fornecido', async () => {
    const res = await POST(makeRequest({ topics: ['Tecnologia'], editionHour: 8 }) as any)
    expect(res.status).toBe(200)
    expect(prisma.user.create).toHaveBeenCalledOnce()
    expect(prisma.user.upsert).not.toHaveBeenCalled()
  })

  it('faz upsert por email quando email é fornecido', async () => {
    const res = await POST(makeRequest({
      email: 'ivan@test.com',
      topics: ['Tecnologia'],
      editionHour: 8,
    }) as any)
    expect(res.status).toBe(200)
    expect(prisma.user.upsert).toHaveBeenCalledOnce()
    expect(prisma.user.create).not.toHaveBeenCalled()
  })

  it('retorna userId no body e seta cookie', async () => {
    const res = await POST(makeRequest({ topics: ['Tecnologia'], editionHour: 8 }) as any)
    const body = await res.json()
    expect(body.userId).toBe('user-abc')
    expect(res.headers.get('set-cookie')).toContain('userId')
  })

  it('inicializa pesos 5 para tópicos selecionados e 1 para demais', async () => {
    await POST(makeRequest({ topics: ['Tecnologia'], editionHour: 8 }) as any)
    const calls = vi.mocked(prisma.userTopicWeight.upsert).mock.calls
    const techCall = calls.find((c) => (c[0] as any).create.topic === 'Tecnologia')
    const ecoCall  = calls.find((c) => (c[0] as any).create.topic === 'Economia')
    expect((techCall![0] as any).create.weight).toBe(5)
    expect((ecoCall![0]  as any).create.weight).toBe(1)
  })

  it('usa linguagem pt-BR como padrão', async () => {
    await POST(makeRequest({ topics: ['Tecnologia'], editionHour: 8 }) as any)
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ language: 'pt-BR' }) })
    )
  })
})
