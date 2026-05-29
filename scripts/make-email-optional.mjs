// Migração: torna o campo email opcional na tabela User (Turso/libSQL)
// SQLite não suporta ALTER COLUMN — precisa recriar a tabela.
// Execute: node scripts/make-email-optional.mjs

import { createClient } from '@libsql/client'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env.local') })

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function run() {
  console.log('Iniciando migração: make-email-optional...')

  await client.executeMultiple(`
    PRAGMA foreign_keys = OFF;

    CREATE TABLE IF NOT EXISTS _User_new (
      id          TEXT     NOT NULL PRIMARY KEY,
      email       TEXT     UNIQUE,
      name        TEXT,
      editionHour INTEGER  NOT NULL DEFAULT 7,
      language    TEXT     NOT NULL DEFAULT 'pt-BR',
      createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    INSERT INTO _User_new (id, email, name, editionHour, language, createdAt, updatedAt)
    SELECT id, email, name, editionHour, language, createdAt, updatedAt
    FROM User;

    DROP TABLE User;

    ALTER TABLE _User_new RENAME TO User;

    PRAGMA foreign_keys = ON;
  `)

  console.log('✓ Migração concluída: email agora é opcional.')
  process.exit(0)
}

run().catch((err) => {
  console.error('Erro na migração:', err)
  process.exit(1)
})
