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

console.log('=== RELATÓRIO DE INDICADORES DE USO (TURSO DB) ===\n')

// 1. Usuários
const users = await client.execute('SELECT id, name, email, language, editionHour, createdAt FROM User ORDER BY createdAt DESC')
console.log(`📌 TOTAL DE USUÁRIOS: ${users.rows.length}`)
for (const u of users.rows) {
  console.log(`  - User [${u.id}]: Nome=${u.name || '(sem nome)'}, Email=${u.email || '(sem email)'}, Lang=${u.language}, EdHora=${u.editionHour}h, CriadoEm=${u.createdAt}`)
}

// 2. Pesos de Tópicos
const topicWeights = await client.execute('SELECT userId, topic, weight, updatedAt FROM UserTopicWeight ORDER BY weight DESC')
console.log(`\n📌 PESOS DE TÓPICOS ATUAIS (${topicWeights.rows.length} registros):`)
for (const tw of topicWeights.rows) {
  console.log(`  - User [${tw.userId}] | Tópico: ${tw.topic} -> Peso: ${tw.weight.toFixed(2)} (Atualizado: ${tw.updatedAt})`)
}

// 3. Edições Geradas
const editions = await client.execute('SELECT id, userId, date, publishedAt FROM Edition ORDER BY date DESC')
console.log(`\n📌 TOTAL DE EDIÇÕES GERADAS: ${editions.rows.length}`)
console.log('  Últimas 5 edições:')
for (const ed of editions.rows.slice(0, 5)) {
  const itemCounts = await client.execute({
    sql: 'SELECT COUNT(*) FROM NewsItem WHERE editionId = ?',
    args: [ed.id]
  })
  console.log(`  - Edição [${ed.date}] (ID: ${ed.id}) | User: ${ed.userId} | Itens: ${itemCounts.rows[0][0]} | Publicado em: ${ed.publishedAt}`)
}

// 4. Notícias e Tópicos
const newsStats = await client.execute('SELECT topic, COUNT(*) as qty, AVG(score) as avgScore FROM NewsItem GROUP BY topic ORDER BY qty DESC')
console.log(`\n📌 DISTRIBUIÇÃO DE NOTÍCIAS POR TÓPICO:`)
for (const ns of newsStats.rows) {
  console.log(`  - ${ns.topic}: ${ns.qty} notícias | Score médio: ${Number(ns.avgScore).toFixed(3)}`)
}

const totalNews = await client.execute('SELECT COUNT(*) FROM NewsItem')
console.log(`  TOTAL DE NOTÍCIAS GERADAS: ${totalNews.rows[0][0]}`)

// 5. Fontes mais frequentes
const sourcesStats = await client.execute('SELECT sourceName, COUNT(*) as qty FROM NewsItem GROUP BY sourceName ORDER BY qty DESC LIMIT 10')
console.log(`\n📌 TOP FONTES DE NOTÍCIAS:`)
for (const src of sourcesStats.rows) {
  console.log(`  - ${src.sourceName}: ${src.qty} artigos`)
}

// 6. Eventos de Feedback (Engajamento)
const feedbacks = await client.execute('SELECT type, topic, delta, createdAt, newsItemId FROM FeedbackEvent ORDER BY createdAt DESC')
console.log(`\n📌 EVENTOS DE INTERAÇÃO / FEEDBACK (${feedbacks.rows.length} no total):`)
if (feedbacks.rows.length === 0) {
  console.log('  (Nenhum evento de feedback registrado ainda)')
} else {
  const byType = {}
  for (const fb of feedbacks.rows) {
    const type = fb.type
    byType[type] = (byType[type] || 0) + 1
  }
  console.log('  Resumo por tipo:', JSON.stringify(byType))
  console.log('\n  Últimos 10 eventos:')
  for (const fb of feedbacks.rows.slice(0, 10)) {
    console.log(`  - [${fb.createdAt}] Tipo: ${fb.type} | Tópico: ${fb.topic} | Delta: ${fb.delta} | NewsId: ${fb.newsItemId}`)
  }
}

await client.close()
