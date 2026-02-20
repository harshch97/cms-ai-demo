import { query } from '../config/db';
import { CityItem, ReferenceItem } from '../types/api.types';

export const referenceRepository = {
  /** Fetch all cities ordered alphabetically. */
  async getAllCities(): Promise<CityItem[]> {
    return query<CityItem>(
      `SELECT id, name, state_id FROM cities ORDER BY name ASC`
    );
  },

  /** Fetch cities belonging to a specific state, ordered alphabetically. */
  async getCitiesByState(stateId: number): Promise<CityItem[]> {
    return query<CityItem>(
      `SELECT id, name, state_id FROM cities WHERE state_id = $1 ORDER BY name ASC`,
      [stateId]
    );
  },

  /** Fetch all states ordered alphabetically. */
  async getAllStates(): Promise<ReferenceItem[]> {
    return query<ReferenceItem>(
      `SELECT id, name FROM states ORDER BY name ASC`
    );
  },

  /**
   * Check whether a city belongs to a given state (both case-insensitive).
   * Used by address validation to ensure city/state combination is valid.
   */
  async cityExistsForState(cityName: string, stateName: string): Promise<boolean> {
    const rows = await query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM cities c
         JOIN states s ON c.state_id = s.id
         WHERE LOWER(c.name) = LOWER($1)
           AND LOWER(s.name) = LOWER($2)
       ) AS exists`,
      [cityName, stateName]
    );
    return rows[0].exists;
  },

  /** Check whether a state name exists in the reference table (case-insensitive). */
  async stateExists(name: string): Promise<boolean> {
    const rows = await query<{ exists: boolean }>(
      `SELECT EXISTS (
         SELECT 1 FROM states WHERE LOWER(name) = LOWER($1)
       ) AS exists`,
      [name]
    );
    return rows[0].exists;
  },
};
