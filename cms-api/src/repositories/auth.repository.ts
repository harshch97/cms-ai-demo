import { query } from '../config/db';
import { User } from '../types/auth.types';

export const authRepository = {
  /** Find a user by email address (case-insensitive). Returns null if not found. */
  async findByEmail(email: string): Promise<User | null> {
    const rows = await query<User>(
      `SELECT id, name, email, password_hash, created_at, updated_at
       FROM users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email]
    );
    return rows[0] ?? null;
  },
};
