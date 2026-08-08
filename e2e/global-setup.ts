import { createClient } from '@libsql/client'

export const E2E_USER_ID   = 'e2e-test-user-id'
export const E2E_USER_EMAIL = 'e2e@feedpessoal.test'

export default async function globalSetup() {
  const db = createClient({
    url: process.env.DATABASE_URL ?? 'file:../auth',
    authToken: process.env.DATABASE_AUTH_TOKEN,
  })

  // limpa dados de teste anteriores
  await db.execute({ sql: `DELETE FROM Edition WHERE userId = ?`, args: [E2E_USER_ID] })
  await db.execute({ sql: `DELETE FROM UserTopicWeight WHERE userId = ?`, args: [E2E_USER_ID] })
  await db.execute({ sql: `DELETE FROM User WHERE id = ?`, args: [E2E_USER_ID] })

  // cria usuário de teste
  await db.execute({
    sql: `INSERT INTO User (id, email, name, language, editionHour)
          VALUES (?, ?, ?, ?, ?)`,
    args: [E2E_USER_ID, E2E_USER_EMAIL, 'Tester E2E', 'pt-BR', 8],
  })

  // configura pesos de tópico
  await db.execute({
    sql: `INSERT INTO UserTopicWeight (userId, topic, weight) VALUES (?, ?, ?)`,
    args: [E2E_USER_ID, 'Tecnologia', 5],
  })

  // cria edição pré-montada para hoje (evita chamar OpenAI no E2E)
  const today = new Date().toISOString().split('T')[0]
  await db.execute({
    sql: `INSERT OR REPLACE INTO Edition (id, userId, date) VALUES (?, ?, ?)`,
    args: ['e2e-edition-id', E2E_USER_ID, today],
  })

  // insere itens da edição
  await db.execute({
    sql: `INSERT OR REPLACE INTO NewsItem
          (id, editionId, topic, sourceId, sourceName, originalTitle, normalizedTitle,
           summary, imageUrl, url, publishedAt, score, position)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'e2e-item-1', 'e2e-edition-id', 'Tecnologia',
      'tech-blog', 'Tech Blog',
      'Original Article Title', 'Título Normalizado para Teste E2E',
      'Este é um resumo gerado para o teste E2E. Contém informações sobre tecnologia.',
      null,
      'https://example.com/e2e-article',
      new Date().toISOString(),
      0.9, 1,
    ],
  })

  console.log('[E2E Setup] Dados de teste inseridos com sucesso')
}
