import { createClient } from '@libsql/client'

const client = createClient({
  url: 'libsql://feed-pessoal-ivanltds.aws-us-east-1.turso.io',
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const statements = [
  `CREATE TABLE IF NOT EXISTS "User" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "email"       TEXT NOT NULL UNIQUE,
    "name"        TEXT,
    "editionHour" INTEGER NOT NULL DEFAULT 7,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS "UserTopicWeight" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "userId"    TEXT NOT NULL,
    "topic"     TEXT NOT NULL,
    "weight"    REAL NOT NULL DEFAULT 1.0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserTopicWeight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("userId", "topic")
  )`,

  `CREATE TABLE IF NOT EXISTS "Edition" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "userId"      TEXT NOT NULL,
    "date"        TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Edition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE ("userId", "date")
  )`,

  `CREATE TABLE IF NOT EXISTS "NewsItem" (
    "id"              TEXT NOT NULL PRIMARY KEY,
    "editionId"       TEXT NOT NULL,
    "topic"           TEXT NOT NULL,
    "sourceId"        TEXT NOT NULL,
    "sourceName"      TEXT NOT NULL,
    "originalTitle"   TEXT NOT NULL,
    "normalizedTitle" TEXT NOT NULL,
    "imageUrl"        TEXT,
    "url"             TEXT NOT NULL,
    "publishedAt"     DATETIME NOT NULL,
    "score"           REAL NOT NULL DEFAULT 0,
    "position"        INTEGER NOT NULL,
    CONSTRAINT "NewsItem_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS "FeedbackEvent" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "userId"     TEXT NOT NULL,
    "newsItemId" TEXT NOT NULL,
    "type"       TEXT NOT NULL,
    "topic"      TEXT NOT NULL,
    "delta"      REAL NOT NULL,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedbackEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FeedbackEvent_newsItemId_fkey" FOREIGN KEY ("newsItemId") REFERENCES "NewsItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
]

console.log('🚀 Aplicando schema no Turso...\n')

for (const sql of statements) {
  const tableName = sql.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)[1]
  try {
    await client.execute(sql)
    console.log(`✅ Tabela "${tableName}" criada`)
  } catch (err) {
    console.error(`❌ Erro em "${tableName}":`, err.message)
  }
}

console.log('\n✨ Pronto!')
