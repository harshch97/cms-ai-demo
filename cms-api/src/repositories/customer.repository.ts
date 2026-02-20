import { PoolClient } from 'pg';
import { pool, query } from '../config/db';
import { Customer } from '../types/customer.types';

// Repository-level types — only the DB columns, no nested objects
interface CustomerCreateData {
  full_name: string;
  company_name: string;
  phone_number: string;
  email: string;
}

interface CustomerUpdateData {
  full_name?: string;
  company_name?: string;
  phone_number?: string;
  email?: string;
}

export const customerRepository = {
  /**
   * Return a paginated, optionally-searched list of customers.
   * OFFSET = (page - 1) * limit
   */
  async findAll(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ rows: Customer[]; total: number }> {
    const offset = (page - 1) * limit;

    if (search) {
      const pattern = `%${search}%`;

      const countResult = await query<{ count: string }>(
        `SELECT COUNT(*) AS count
         FROM customers
         WHERE full_name ILIKE $1
            OR email     ILIKE $1
            OR company_name ILIKE $1`,
        [pattern]
      );

      const rows = await query<Customer>(
        `SELECT id, full_name, company_name, phone_number, email, created_at, updated_at
         FROM customers
         WHERE full_name ILIKE $1
            OR email     ILIKE $1
            OR company_name ILIKE $1
         ORDER BY full_name ASC
         LIMIT $2 OFFSET $3`,
        [pattern, limit, offset]
      );

      return { rows, total: parseInt(countResult[0].count, 10) };
    }

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM customers`
    );

    const rows = await query<Customer>(
      `SELECT id, full_name, company_name, phone_number, email, created_at, updated_at
       FROM customers
       ORDER BY full_name ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return { rows, total: parseInt(countResult[0].count, 10) };
  },

  /** Find one customer by numeric ID. Returns undefined if not found. */
  async findById(id: number): Promise<Customer | undefined> {
    const rows = await query<Customer>(
      `SELECT id, full_name, company_name, phone_number, email, created_at, updated_at
       FROM customers
       WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  /** Find one customer by email (used for duplicate-email checks). */
  async findByEmail(email: string): Promise<Customer | undefined> {
    const rows = await query<Customer>(
      `SELECT id, full_name, company_name, phone_number, email, created_at, updated_at
       FROM customers
       WHERE email = $1`,
      [email]
    );
    return rows[0];
  },

  /** Insert a new customer row. Returns the full created record. */
  async create(data: CustomerCreateData, client?: PoolClient): Promise<Customer> {
    const executor = client ?? pool;
    const result = await executor.query<Customer>(
      `INSERT INTO customers (full_name, company_name, phone_number, email)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, company_name, phone_number, email, created_at, updated_at`,
      [data.full_name, data.company_name, data.phone_number, data.email]
    );
    return result.rows[0];
  },

  /**
   * Update only the fields that are present in the payload.
   * Builds the SET clause dynamically using parameterised values —
   * the column names come from a controlled whitelist, never from user input.
   */
  async update(id: number, data: CustomerUpdateData, client?: PoolClient): Promise<Customer | undefined> {
    const ALLOWED_COLUMNS: Record<string, string> = {
      full_name: 'full_name',
      company_name: 'company_name',
      phone_number: 'phone_number',
      email: 'email',
    };

    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && ALLOWED_COLUMNS[key]) {
        setClauses.push(`${ALLOWED_COLUMNS[key]} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (setClauses.length === 0) return undefined;

    setClauses.push(`updated_at = NOW()`);
    values.push(id);

    const executor = client ?? pool;
    const result = await executor.query<Customer>(
      `UPDATE customers
       SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, full_name, company_name, phone_number, email, created_at, updated_at`,
      values
    );
    return result.rows[0];
  },

  /**
   * Hard-delete a customer by ID.
   * PostgreSQL CASCADE on the addresses FK handles address deletion automatically.
   * We still wrap this at the service layer in a transaction for auditability.
   */
  async deleteById(id: number, client?: PoolClient): Promise<boolean> {
    const executor = client ?? pool;
    const result = await executor.query(
      `DELETE FROM customers WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  },
};
