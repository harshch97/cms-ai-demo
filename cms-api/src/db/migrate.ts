/**
 * Database Migration Runner
 *
 * - Reads all *.sql files from src/db/migrations/ in lexicographic order.
 * - Maintains a `schema_migrations` table to track which migrations have been applied.
 * - Skips already-applied migrations (idempotent).
 * - Each migration file is executed inside a transaction — if it fails, it rolls back
 *   and the process exits with code 1.
 *
 * Run via:  npm run db:migrate
 */

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function createMigrationsTable(client: import('pg').PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id         SERIAL       PRIMARY KEY,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(client: import('pg').PoolClient): Promise<Set<string>> {
  const result = await client.query<{ filename: string }>(
    `SELECT filename FROM schema_migrations ORDER BY applied_at ASC`
  );
  return new Set(result.rows.map((r) => r.filename));
}

async function runMigrations(): Promise<void> {
  const client = await pool.connect();

  try {
    // Ensure the migrations tracking table exists
    await client.query('BEGIN');
    await createMigrationsTable(client);
    await client.query('COMMIT');

    const applied = await getAppliedMigrations(client);

    // Collect and sort migration files in order
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    let appliedCount = 0;

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`  [SKIP]  ${file} — already applied`);
        continue;
      }

      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`  [RUN]   ${file}`);

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          `INSERT INTO schema_migrations (filename) VALUES ($1)`,
          [file]
        );
        await client.query('COMMIT');
        console.log(`  [OK]    ${file}`);
        appliedCount++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  [FAIL]  ${file}:`, (err as Error).message);
        throw err;
      }
    }

    if (appliedCount === 0) {
      console.log('\nNo new migrations to apply. Database is up to date.');
    } else {
      console.log(`\nMigrations complete. Applied: ${appliedCount} file(s).`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('\nMigration runner failed:', err.message);
  process.exit(1);
});
