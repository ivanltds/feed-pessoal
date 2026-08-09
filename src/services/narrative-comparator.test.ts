import { describe, it, expect, vi } from 'vitest'
import { compareNarratives } from './narrative-comparator'

vi.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  actors: [
                    {
                      id: 'corinthians',
                      name: 'Torcida do Corinthians',
                      title: 'Versão da Torcida Principal',
                      summary: 'Relata provocação inicial e reação dos torcedores no local.'
                    },
                    {
                      id: 'rival',
                      name: 'Torcida Rival',
                      title: 'Versão dos Adversários',
                      summary: 'Alega emboscada e defesa dos seus integrantes na área.'
                    },
                    {
                      id: 'moradores',
                      name: 'Moradores Locais',
                      title: 'Danos ao Comércio e Bairro',
                      summary: 'Relata destruição de fachada de lojas e pânico entre vizinhos.'
                    },
                    {
                      id: 'policia',
                      name: 'Organização / Polícia',
                      title: 'Atuação de Segurança',
                      summary: 'Informa contenção, prisões efetuadas e reforço de patrulhamento.'
                    }
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

describe('compareNarratives', () => {
  it('extrai até 5 partes interessadas fáticas para notícias esportivas/sociais', async () => {
    const item = {
      id: 'item-1',
      normalizedTitle: 'Briga entre torcidas organizadas deixa feridos no entorno do estádio',
      topic: 'Futebol',
      summary: 'Confronto entre torcedores causou tumulto no bairro e mobilizou a polícia.',
      sourceName: 'GE Globo'
    }

    const result = await compareNarratives(item)

    expect(result.actors).toHaveLength(4)
    expect(result.actors[0].name).toBe('Torcida do Corinthians')
    expect(result.actors[2].name).toBe('Moradores Locais')
    expect(result.actors[3].name).toBe('Organização / Polícia')
  })
})
