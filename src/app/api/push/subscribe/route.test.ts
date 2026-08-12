import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, DELETE } from './route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    pushSubscription: {
      upsert: vi.fn().mockResolvedValue({ id: 'sub-123' }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 })
    }
  }
}))

describe('API /api/push/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 400 se dados estiverem incompletos', async () => {
    const req = new NextRequest('http://localhost/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-1' })
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('salva a inscrição no banco no caminho feliz', async () => {
    const req = new NextRequest('http://localhost/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user-1',
        subscription: {
          endpoint: 'https://push.example.com/sub123',
          keys: {
            p256dh: 'test-p256dh-key',
            auth: 'test-auth-key'
          }
        }
      })
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(prisma.pushSubscription.upsert).toHaveBeenCalledOnce()
  })

  it('deleta inscrição via DELETE', async () => {
    const req = new NextRequest('http://localhost/api/push/subscribe', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint: 'https://push.example.com/sub123' })
    })

    const res = await DELETE(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledOnce()
  })
})
