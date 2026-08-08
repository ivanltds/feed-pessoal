import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf-8')
    .split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => {
      const idx = l.indexOf('=')
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim().replace(/^["']|["']$/g, '')]
    })
)

const client = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
})

console.log('=== AUDITORIA DE QUALIDADE E SCORES DA EDIÇÃO ATUAL ===\n')

const today = new Date().toISOString().split('T')[0]

const editions = await client.execute({
  sql: 'SELECT id, userId, date, publishedAt FROM Edition ORDER BY publishedAt DESC LIMIT 1'
})

if (editions.rows.length === 0) {
  console.log('Nenhuma edição encontrada.')
} else {
  const ed = editions.rows[0]
  console.log(`📌 EDIÇÃO AUDITADA: Data ${ed[2]} | ID: ${ed[0]}\n`)

  const items = await client.execute({
    sql: 'SELECT position, topic, normalizedTitle, sourceName, score, publishedAt FROM NewsItem WHERE editionId = ? ORDER BY position ASC',
    args: [ed[0]]
  })

  for (const it of items.rows) {
    const pos = String(it[0]).padStart(2, '0')
    const topic = String(it[1]).padEnd(22, ' ')
    const source = String(it[3]).padEnd(16, ' ')
    const score = Number(it[4]).toFixed(2)
    const title = String(it[2]).slice(0, 50)
    console.log(`[#${pos}] Score: ${score} | ${topic} | ${source} | "${title}..."`)
  }
}

await client.close()
