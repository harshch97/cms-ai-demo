import { referenceRepository } from '../repositories/reference.repository';
import { CityItem, ReferenceItem } from '../types/api.types';
import { NotFoundError } from '../utils/errors';

export const referenceService = {
  /** Returns all cities (unfiltered). */
  async getCities(): Promise<CityItem[]> {
    return referenceRepository.getAllCities();
  },

  /**
   * Returns cities that belong to the given state.
   * Throws NotFoundError if the stateId matches no state.
   */
  async getCitiesByState(stateId: number): Promise<CityItem[]> {
    // Validate that the state exists first so we return a clear 404 rather than an empty list
    const states = await referenceRepository.getAllStates();
    const stateExists = states.some((s) => s.id === stateId);
    if (!stateExists) {
      throw new NotFoundError('State', stateId);
    }
    return referenceRepository.getCitiesByState(stateId);
  },

  /** Returns all states. */
  async getStates(): Promise<ReferenceItem[]> {
    return referenceRepository.getAllStates();
  },
};
