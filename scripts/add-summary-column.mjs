import { createClient } from '@libsql/client'
import { readFileSync } from 'fs'

// Lê .env.local manualmente
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

try {
  await client.execute('ALTER TABLE NewsItem ADD COLUMN summary TEXT;')
  console.log('✅ Coluna summary adicionada com sucesso.')
} catch (err) {
  if (err.message?.includes('duplicate column')) {
    console.log('ℹ️ Coluna summary já existe — nada a fazer.')
  } else {
    console.error('❌ Erro:', err.message)
  }
}

await client.close()
