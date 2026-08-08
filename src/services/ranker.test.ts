import { describe, it, expect, vi, beforeEach } from 'vitest'
import { rankItems, applyFeedbackDeltas, type TopicWeights } from './ranker'
import type { RawNewsItem } from '@/domain/news/types'

// ── helpers ────────────────────────────────────────────────────────────────
function makeItem(
  i: number,
  overrides: Partial<RawNewsItem> = {}
): RawNewsItem {
  return {
    sourceId: `source-${i}`,
    sourceName: `Source ${i}`,
    topic: 'Tecnologia',
    title: `Article ${i}`,
    url: `https://example.com/${i}`,
    publishedAt: new Date(Date.now() - i * 60_000), // i minutos atrás
    ...overrides,
  }
}

// ── rankItems ──────────────────────────────────────────────────────────────
describe('rankItems', () => {
  it('retorna lista vazia quando não há candidatos', () => {
    expect(rankItems([], {})).toHaveLength(0)
  })

  it('nunca retorna mais de 30 itens (MAX_TOTAL)', () => {
    const candidates = Array.from({ length: 100 }, (_, i) => makeItem(i))
    const result = rankItems(candidates, {})
    expect(result.length).toBeLessThanOrEqual(30)
  })

  it('deduplica itens com a mesma URL', () => {
    const items = [
      makeItem(1, { url: 'https://dup.com' }),
      makeItem(2, { url: 'https://dup.com' }), // duplicata
      makeItem(3, { url: 'https://unique.com' }),
    ]
    const result = rankItems(items, {})
    const urls = result.map((i) => i.url)
    const unique = new Set(urls)
    expect(urls.length).toBe(unique.size)
  })

  it('respeita cap de 3 itens por fonte (MAX_PER_SOURCE)', () => {
    const sameSource = Array.from({ length: 10 }, (_, i) =>
      makeItem(i, { sourceId: 'monopoly-source', url: `https://monopoly.com/${i}` })
    )
    const result = rankItems(sameSource, {})
    const fromSame = result.filter((i) => i.sourceId === 'monopoly-source')
    expect(fromSame.length).toBeLessThanOrEqual(3)
  })

  it('adiciona normalizedTitle e score no item retornado', () => {
    const result = rankItems([makeItem(0)], {})
    expect(result[0]).toHaveProperty('normalizedTitle')
    expect(result[0]).toHaveProperty('score')
    expect(typeof result[0].score).toBe('number')
  })

  it('itens mais recentes têm score maior (mesmo tópico/fonte)', () => {
    const recent = makeItem(0, { url: 'https://a.com', publishedAt: new Date(Date.now() - 1_000) })
    const old    = makeItem(1, { url: 'https://b.com', publishedAt: new Date(Date.now() - 12 * 3600_000) })
    const result = rankItems([old, recent], {})
    expect(result[0].url).toBe('https://a.com')
  })

  it('tópico com maior peso recebe mais itens', () => {
    const techItems  = Array.from({ length: 20 }, (_, i) =>
      makeItem(i, { topic: 'Tecnologia', url: `https://tech.com/${i}` })
    )
    const ecoItems   = Array.from({ length: 20 }, (_, i) =>
      makeItem(i + 20, { topic: 'Economia', url: `https://eco.com/${i}` })
    )
    const weights: TopicWeights = { Tecnologia: 8, Economia: 2 }
    const result = rankItems([...techItems, ...ecoItems], weights)
    const techCount = result.filter((i) => i.topic === 'Tecnologia').length
    const ecoCount  = result.filter((i) => i.topic === 'Economia').length
    expect(techCount).toBeGreaterThan(ecoCount)
  })

  it('garante mínimo de 2 itens por tópico quando há candidatos suficientes', () => {
    const techItems = Array.from({ length: 5 }, (_, i) =>
      makeItem(i, { topic: 'Tecnologia', url: `https://t.com/${i}` })
    )
    const ecoItems  = Array.from({ length: 5 }, (_, i) =>
      makeItem(i + 5, { topic: 'Economia', url: `https://e.com/${i}` })
    )
    // Economia tem peso muito baixo mas ainda deve aparecer com >= 2 itens
    const weights: TopicWeights = { Tecnologia: 9, Economia: 0.5 }
    const result = rankItems([...techItems, ...ecoItems], weights)
    const ecoCount = result.filter((i) => i.topic === 'Economia').length
    expect(ecoCount).toBeGreaterThanOrEqual(2)
  })
})

// ── applyFeedbackDeltas ────────────────────────────────────────────────────
describe('applyFeedbackDeltas', () => {
  it('não altera pesos se não há eventos', () => {
    const weights = { Tecnologia: 5, Economia: 3 }
    const result = applyFeedbackDeltas(weights, [])
    expect(result).toEqual(weights)
  })

  it('aumenta peso após long_read (+1.5)', () => {
    const result = applyFeedbackDeltas({ Tecnologia: 3 }, [
      { topic: 'Tecnologia', type: 'long_read' },
    ])
    expect(result.Tecnologia).toBeCloseTo(4.5)
  })

  it('aumenta peso mais ainda após deep_dive_question (+2.5)', () => {
    const result = applyFeedbackDeltas({ Tecnologia: 3 }, [
      { topic: 'Tecnologia', type: 'deep_dive_question' },
    ])
    expect(result.Tecnologia).toBeCloseTo(5.5)
  })

  it('reduz peso após skip (-0.5)', () => {
    const result = applyFeedbackDeltas({ Tecnologia: 3 }, [
      { topic: 'Tecnologia', type: 'skip' },
    ])
    expect(result.Tecnologia).toBeCloseTo(2.5)
  })

  it('clampeia peso no máximo 10', () => {
    const result = applyFeedbackDeltas({ Tecnologia: 9.9 }, [
      { topic: 'Tecnologia', type: 'long_read' },
      { topic: 'Tecnologia', type: 'deep_dive_question' },
    ])
    expect(result.Tecnologia).toBeLessThanOrEqual(10)
  })

  it('clampeia peso no mínimo 0.1', () => {
    const result = applyFeedbackDeltas({ Tecnologia: 0.2 }, [
      { topic: 'Tecnologia', type: 'skip' },
      { topic: 'Tecnologia', type: 'skip' },
      { topic: 'Tecnologia', type: 'skip' },
    ])
    expect(result.Tecnologia).toBeGreaterThanOrEqual(0.1)
  })

  it('cria entrada para tópico sem peso prévio (usa DEFAULT_WEIGHT=1.0)', () => {
    const result = applyFeedbackDeltas({}, [
      { topic: 'NovoTopico', type: 'long_read' },
    ])
    expect(result.NovoTopico).toBeCloseTo(2.5) // 1.0 + 1.5
  })

  it('acumula múltiplos eventos no mesmo tópico', () => {
    const result = applyFeedbackDeltas({ Tecnologia: 3 }, [
      { topic: 'Tecnologia', type: 'long_read' },    // +1.5 → 4.5
      { topic: 'Tecnologia', type: 'long_read' },    // +1.5 → 6.0
    ])
    expect(result.Tecnologia).toBeCloseTo(6.0)
  })

  it('não afeta outros tópicos', () => {
    const result = applyFeedbackDeltas({ Tecnologia: 5, Economia: 3 }, [
      { topic: 'Tecnologia', type: 'skip' },
    ])
    expect(result.Economia).toBe(3)
  })
})
