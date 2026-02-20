/**
 * Admin User Seeder
 *
 * Creates a default admin user in the `users` table.
 * Safe to run multiple times — skips creation if the email already exists.
 *
 * Default credentials (CHANGE IN PRODUCTION):
 *   Email   : admin@cms.com
 *   Password: Admin@123
 *
 * Run via:  npm run seed:admin
 */

import bcrypt from 'bcryptjs';
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

const ADMIN = {
  name: 'Admin',
  email: 'admin@cms.com',
  password: 'Admin@123',
};

async function seedAdmin(): Promise<void> {
  const client = await pool.connect();

  try {
    // Check if the user already exists
    const existing = await client.query(
      `SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`,
      [ADMIN.email]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      console.log(`[SKIP]  Admin user '${ADMIN.email}' already exists.`);
      return;
    }

    // Hash the password with bcrypt (10 salt rounds)
    const passwordHash = await bcrypt.hash(ADMIN.password, 10);

    await client.query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)`,
      [ADMIN.name, ADMIN.email, passwordHash]
    );

    console.log(`[OK]    Admin user created.`);
    console.log(`        Email   : ${ADMIN.email}`);
    console.log(`        Password: ${ADMIN.password}`);
    console.log(`\n  ⚠️  Change the password immediately in a production environment.`);
  } finally {
    client.release();
    await pool.end();
  }
}

seedAdmin().catch((err) => {
  console.error('[ERROR]', err.message);
  process.exit(1);
});
