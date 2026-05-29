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
console.log(`📅 Buscando edições de ${today}...`)

// Lista todas as edições de hoje
const editions = await client.execute({
  sql: `SELECT id, userId, date FROM "Edition" WHERE date = ?`,
  args: [today],
})

console.log(`🔍 Encontradas: ${editions.rows.length} edição(ões)`)

for (const row of editions.rows) {
  const editionId = row[0]
  console.log(`  → Deletando itens da edição ${editionId}...`)
  await client.execute({ sql: `DELETE FROM "NewsItem" WHERE editionId = ?`, args: [editionId] })
  console.log(`  → Deletando edição ${editionId}...`)
  await client.execute({ sql: `DELETE FROM "Edition" WHERE id = ?`, args: [editionId] })
}

// Confirma
const check = await client.execute({
  sql: `SELECT COUNT(*) as total FROM "Edition" WHERE date = ?`,
  args: [today],
})
console.log(`✅ Edições restantes hoje: ${check.rows[0][0]}`)
console.log('Recarregue o feed para gerar nova edição com 30 notícias e resumos.')

await client.close()
