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

try {
  await client.execute(`ALTER TABLE "User" ADD COLUMN language TEXT NOT NULL DEFAULT 'pt-BR'`)
  console.log('✅ Coluna language adicionada.')
} catch (err) {
  if (err.message?.includes('duplicate column')) {
    console.log('ℹ️ Coluna language já existe.')
  } else {
    console.error('❌ Erro:', err.message)
  }
}

await client.close()
