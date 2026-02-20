import { addressRepository } from '../repositories/address.repository';
import { customerRepository } from '../repositories/customer.repository';
import { referenceRepository } from '../repositories/reference.repository';
import { withTransaction } from '../config/db';
import { Address, CreateAddressDto, UpdateAddressDto } from '../types/address.types';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export const addressService = {
  /**
   * Returns all addresses for a given customer.
   * Throws NotFoundError if the customer does not exist.
   */
  async getAddressesByCustomer(customerId: number): Promise<Address[]> {
    const customer = await customerRepository.findById(customerId);
    if (!customer) {
      throw new NotFoundError('Customer', customerId);
    }
    return addressRepository.findByCustomerId(customerId);
  },

  /**
   * Adds a new address to a customer.
   * Validates that the city and state values exist in the reference tables (DB-driven).
   * Wrapped in a transaction: verify customer + insert address atomically.
   */
  async addAddress(customerId: number, data: CreateAddressDto): Promise<Address> {
    // Validate that the selected state exists
    const stateValid = await referenceRepository.stateExists(data.state);
    if (!stateValid) {
      throw new ValidationError(
        `State '${data.state}' is not a valid option. Please select from the dropdown.`
      );
    }

    // Validate that the city belongs to the selected state
    const cityValid = await referenceRepository.cityExistsForState(data.city, data.state);
    if (!cityValid) {
      throw new ValidationError(
        `City '${data.city}' does not belong to state '${data.state}'. Please select a valid city for the chosen state.`
      );
    }

    return withTransaction(async (client) => {
      // Re-verify inside transaction that the customer still exists
      const customer = await customerRepository.findById(customerId);
      if (!customer) {
        throw new NotFoundError('Customer', customerId);
      }

      const address = await addressRepository.create(customerId, data, client);
      logger.info(`Address created: id=${address.id} customer_id=${customerId}`);
      return address;
    });
  },

  /**
   * Updates an existing address.
   * Validates city/state if they are being changed.
   * Throws NotFoundError if the address does not exist.
   */
  async updateAddress(addressId: number, data: UpdateAddressDto): Promise<Address> {
    const existing = await addressRepository.findById(addressId);
    if (!existing) {
      throw new NotFoundError('Address', addressId);
    }

    // Validate city/state combination when either field is being updated.
    // Resolve the effective values by falling back to the existing address's stored values.
    if (data.city || data.state) {
      const effectiveCity  = data.city  ?? existing.city;
      const effectiveState = data.state ?? existing.state;

      const stateValid = await referenceRepository.stateExists(effectiveState);
      if (!stateValid) {
        throw new ValidationError(
          `State '${effectiveState}' is not a valid option. Please select from the dropdown.`
        );
      }

      const cityValid = await referenceRepository.cityExistsForState(effectiveCity, effectiveState);
      if (!cityValid) {
        throw new ValidationError(
          `City '${effectiveCity}' does not belong to state '${effectiveState}'. Please select a valid city for the chosen state.`
        );
      }
    }

    const updated = await addressRepository.update(addressId, data);
    if (!updated) {
      throw new NotFoundError('Address', addressId);
    }

    logger.info(`Address updated: id=${addressId}`);
    return updated;
  },

  /**
   * Hard-deletes a single address.
   * Throws NotFoundError if the address does not exist.
   */
  async deleteAddress(addressId: number): Promise<void> {
    await withTransaction(async (client) => {
      const existing = await addressRepository.findById(addressId);
      if (!existing) {
        throw new NotFoundError('Address', addressId);
      }

      await addressRepository.deleteById(addressId, client);
      logger.info(`Address hard-deleted: id=${addressId}`);
    });
  },
};
