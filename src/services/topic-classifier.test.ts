import { describe, it, expect, vi } from 'vitest'
import { classifyNewsItems } from './topic-classifier'

vi.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  classifications: [
                    { id: 0, topic: 'Geopolítica' },
                    { id: 1, topic: 'Cinema & Séries' }
                  ]
                })
              }
            }
          ]
        })
      }
    }
  }
}))

describe('classifyNewsItems', () => {
  it('classifica corretamente materias de Putin em Geopolítica e Resident Evil em Cinema & Séries', async () => {
    const rawItems = [
      {
        sourceId: 'fa',
        sourceName: 'Foreign Affairs',
        topic: 'América Latina', // Tag errada original
        title: 'Após Putin. A Rússia se prepara para uma crise de sucessão...',
        url: 'https://example.com/1',
        publishedAt: new Date()
      },
      {
        sourceId: 'ign',
        sourceName: 'IGN Brasil',
        topic: 'Computação Quântica', // Tag errada original
        title: 'Filme de Resident Evil 2026: Data de estreia...',
        url: 'https://example.com/2',
        publishedAt: new Date()
      }
    ]

    const userTopics = ['Geopolítica', 'Cinema & Séries', 'América Latina', 'Computação Quântica']

    const classified = await classifyNewsItems(rawItems, userTopics)

    expect(classified[0].topic).toBe('Geopolítica')
    expect(classified[1].topic).toBe('Cinema & Séries')
  })
})
