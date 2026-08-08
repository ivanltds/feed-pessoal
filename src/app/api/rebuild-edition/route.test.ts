import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    edition: {
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
  },
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'user-123' }),
  }),
}))

vi.mock('@/services/edition-builder', () => ({
  buildEditionForUser: vi.fn().mockResolvedValue('success'),
}))

const { POST } = await import('./route')
const { prisma } = await import('@/lib/prisma')
const { buildEditionForUser } = await import('@/services/edition-builder')
const nextHeaders = await import('next/headers')

describe('POST /api/rebuild-edition', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna 401 se userId não está no cookie', async () => {
    vi.mocked(nextHeaders.cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as any)
    const res = await POST()
    expect(res.status).toBe(401)
  })

  it('apaga edição de hoje e chama buildEditionForUser', async () => {
    vi.mocked(nextHeaders.cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'user-123' }),
    } as any)
    vi.mocked(buildEditionForUser).mockResolvedValue('success')

    const res = await POST()
    expect(res.status).toBe(200)
    expect(prisma.edition.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'user-123' }) })
    )
    expect(buildEditionForUser).toHaveBeenCalledWith('user-123')
  })

  it('retorna 422 se buildEditionForUser retorna no_topics', async () => {
    vi.mocked(nextHeaders.cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: 'user-123' }),
    } as any)
    vi.mocked(buildEditionForUser).mockResolvedValue('no_topics')
    const res = await POST()
    expect(res.status).toBe(422)
  })
})
