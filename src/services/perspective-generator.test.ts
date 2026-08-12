import { describe, it, expect, vi } from 'vitest'
import { generatePerspectives } from './perspective-generator'

vi.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  perspectives: [
                    {
                      type: 'impact',
                      badge: '⚡ Impacto Prático',
                      title: 'Impacto no Mercado',
                      summary: 'A decisão altera as taxas de juros globais.'
                    },
                    {
                      type: 'counterpoint',
                      badge: '⚖️ Contraponto & Riscos',
                      title: 'Riscos de Inflação',
                      summary: 'Analistas apontam perigo de aumento de custos.'
                    },
                    {
                      type: 'global_south',
                      badge: '🌍 Sul Global & Emergentes',
                      title: 'Repercussão na América Latina',
                      summary: 'Impactos no mercado de câmbio regional.'
                    },
                    {
                      type: 'outlook',
                      badge: '🔮 Próximos Passos',
                      title: 'Decisão do Copom',
                      summary: 'Próxima reunião definirá os rumos no Brasil.'
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

describe('generatePerspectives', () => {
  it('gerencia perspectivas em formato 360 graus corretamente', async () => {
    const res = await generatePerspectives({
      id: 'test-1',
      topic: 'Economia',
      normalizedTitle: 'Banco Central altera taxa de juros',
      summary: 'Resumo sobre a Selic.'
    })

    expect(res.newsItemId).toBe('test-1')
    expect(res.perspectives.length).toBe(4)
    expect(res.perspectives[0].badge).toContain('Impacto Prático')
    expect(res.perspectives[1].type).toBe('counterpoint')
    expect(res.perspectives[2].type).toBe('global_south')
    expect(res.perspectives[3].type).toBe('outlook')
  })
})
