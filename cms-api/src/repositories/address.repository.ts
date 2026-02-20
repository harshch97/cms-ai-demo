import { PoolClient } from 'pg';
import { pool, query } from '../config/db';
import { Address, CreateAddressDto, UpdateAddressDto } from '../types/address.types';

export const addressRepository = {
  /** Return all addresses belonging to a customer, oldest first. */
  async findByCustomerId(customerId: number): Promise<Address[]> {
    return query<Address>(
      `SELECT id, customer_id, house_flat_number, building_street, locality_area,
              city, state, pin_code, created_at, updated_at
       FROM addresses
       WHERE customer_id = $1
       ORDER BY created_at ASC`,
      [customerId]
    );
  },

  /** Find a single address by its numeric ID. */
  async findById(id: number): Promise<Address | undefined> {
    const rows = await query<Address>(
      `SELECT id, customer_id, house_flat_number, building_street, locality_area,
              city, state, pin_code, created_at, updated_at
       FROM addresses
       WHERE id = $1`,
      [id]
    );
    return rows[0];
  },

  /**
   * Insert a new address for the given customer.
   * Accepts an optional PoolClient so it can participate in a transaction.
   */
  async create(
    customerId: number,
    data: CreateAddressDto,
    client?: PoolClient
  ): Promise<Address> {
    const executor = client ?? pool;
    const result = await executor.query<Address>(
      `INSERT INTO addresses
         (customer_id, house_flat_number, building_street, locality_area, city, state, pin_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, customer_id, house_flat_number, building_street, locality_area,
                 city, state, pin_code, created_at, updated_at`,
      [
        customerId,
        data.house_flat_number,
        data.building_street,
        data.locality_area,
        data.city,
        data.state,
        data.pin_code,
      ]
    );
    return result.rows[0];
  },

  /**
   * Update only the fields present in the payload.
   * Column names come from a controlled whitelist — never from user input.
   * Accepts an optional PoolClient so it can participate in a transaction.
   */
  async update(id: number, data: UpdateAddressDto, client?: PoolClient): Promise<Address | undefined> {
    const ALLOWED_COLUMNS: Record<string, string> = {
      house_flat_number: 'house_flat_number',
      building_street: 'building_street',
      locality_area: 'locality_area',
      city: 'city',
      state: 'state',
      pin_code: 'pin_code',
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
    const result = await executor.query<Address>(
      `UPDATE addresses
       SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING id, customer_id, house_flat_number, building_street, locality_area,
                 city, state, pin_code, created_at, updated_at`,
      values
    );
    return result.rows[0];
  },

  /** Hard-delete a single address. Accepts optional PoolClient for transactions. */
  async deleteById(id: number, client?: PoolClient): Promise<boolean> {
    const executor = client ?? pool;
    const result = await executor.query(
      `DELETE FROM addresses WHERE id = $1`,
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  },
};
