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

const today = new Date().toISOString().split('T')[0]

const editions = await client.execute({
  sql: `SELECT id FROM "Edition" WHERE date = ?`,
  args: [today],
})

for (const row of editions.rows) {
  const editionId = row[0]
  const items = await client.execute({
    sql: `SELECT topic, COUNT(*) as n FROM "NewsItem" WHERE editionId = ? GROUP BY topic`,
    args: [editionId],
  })
  console.log(`\nEdição ${editionId}:`)
  let total = 0
  for (const r of items.rows) {
    console.log(`  ${r[0]}: ${r[1]} itens`)
    total += Number(r[1])
  }
  console.log(`  TOTAL: ${total} itens`)
}

await client.close()
