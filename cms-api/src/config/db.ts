import { Pool, PoolClient, QueryResultRow } from 'pg';
import { env } from './env';

export const pool = new Pool({
  host: env.DB.HOST,
  port: env.DB.PORT,
  user: env.DB.USER,
  password: env.DB.PASSWORD,
  database: env.DB.NAME,
  min: env.DB.POOL_MIN,
  max: env.DB.POOL_MAX,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
  process.exit(1);
});

/**
 * Execute a single raw SQL query using the pool.
 * Always uses parameterised queries — never string interpolation.
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await pool.query<T>(sql, params);
  return result.rows;
}

/**
 * Run multiple operations inside a single PostgreSQL transaction.
 * Automatically COMMITs on success and ROLLBACKs on any error.
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function testConnection(): Promise<void> {
  const client = await pool.connect();
  client.release();
}
