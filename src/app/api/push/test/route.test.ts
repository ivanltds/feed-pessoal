import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { NextRequest } from 'next/server'
import { sendPushNotificationToUser } from '@/lib/push-sender'

vi.mock('@/lib/push-sender', () => ({
  sendPushNotificationToUser: vi.fn()
}))

describe('API /api/push/test', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 400 se userId não for informado', async () => {
    const req = new NextRequest('http://localhost/api/push/test', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('retorna 404 se não houver dispositivos cadastrados', async () => {
    vi.mocked(sendPushNotificationToUser).mockResolvedValue({ successCount: 0, failureCount: 0 })

    const req = new NextRequest('http://localhost/api/push/test', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-1' })
    })

    const res = await POST(req)
    expect(res.status).toBe(404)
  })

  it('retorna 200 quando notificação é disparada com sucesso', async () => {
    vi.mocked(sendPushNotificationToUser).mockResolvedValue({ successCount: 1, failureCount: 0 })

    const req = new NextRequest('http://localhost/api/push/test', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-1' })
    })

    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.delivered).toBe(1)
  })
})
