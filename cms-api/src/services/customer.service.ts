import { customerRepository } from '../repositories/customer.repository';
import { addressRepository } from '../repositories/address.repository';
import { referenceRepository } from '../repositories/reference.repository';
import { withTransaction } from '../config/db';
import {
  Customer,
  CustomerWithAddresses,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '../types/customer.types';
import { PaginatedResponse } from '../types/api.types';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

/** Validates that the city belongs to the given state. Throws ValidationError on failure. */
async function validateCityState(city: string, state: string): Promise<void> {
  const stateValid = await referenceRepository.stateExists(state);
  if (!stateValid) {
    throw new ValidationError(
      `State '${state}' is not a valid option. Please select from the dropdown.`
    );
  }
  const cityValid = await referenceRepository.cityExistsForState(city, state);
  if (!cityValid) {
    throw new ValidationError(
      `City '${city}' does not belong to state '${state}'. Please select a valid city for the chosen state.`
    );
  }
}

export const customerService = {
  /**
   * Returns a paginated list of customers with an optional search term.
   */
  async listCustomers(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginatedResponse<Customer>> {
    const { rows, total } = await customerRepository.findAll(page, limit, search);
    return {
      items: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Fetches a single customer by ID together with all their addresses.
   * Throws NotFoundError if the customer does not exist.
   */
  async getCustomerById(id: number): Promise<CustomerWithAddresses> {
    const customer = await customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer', id);
    }
    const addresses = await addressRepository.findByCustomerId(id);
    return { ...customer, addresses };
  },

  /**
   * Creates a new customer and their address in a single transaction.
   * - Validates email uniqueness before entering the transaction.
   * - Validates city/state combination against reference tables.
   * - Both customer and address rows are inserted atomically.
   */
  async createCustomer(data: CreateCustomerDto): Promise<CustomerWithAddresses> {
    // Pre-flight checks outside transaction (cheap reads)
    const existing = await customerRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError(`Email '${data.email}' is already registered`);
    }

    await validateCityState(data.address.city, data.address.state);

    return withTransaction(async (client) => {
      const { address: addressData, ...customerData } = data;

      const customer = await customerRepository.create(customerData, client);
      const address = await addressRepository.create(customer.id, addressData, client);

      logger.info(`Customer created: id=${customer.id} email=${customer.email}`);
      logger.info(`Address created: id=${address.id} customer_id=${customer.id}`);

      return { ...customer, addresses: [address] };
    });
  },

  /**
   * Updates a customer and optionally their address in a single transaction.
   *
   * Address update behaviour:
   *   - If `address.id` is provided → updates that specific address (must belong to this customer).
   *   - If address data is given without `address.id` → updates the customer's first address,
   *     or creates a new one if none exist yet.
   *   - If no `address` key is present in the payload → only customer fields are updated.
   */
  async updateCustomer(id: number, data: UpdateCustomerDto): Promise<CustomerWithAddresses> {
    const existing = await customerRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Customer', id);
    }

    // Email uniqueness check when email is being changed
    if (data.email && data.email !== existing.email) {
      const emailOwner = await customerRepository.findByEmail(data.email);
      if (emailOwner) {
        throw new ConflictError(`Email '${data.email}' is already registered`);
      }
    }

    // Validate city/state if either is being changed
    if (data.address) {
      const { id: addressId, ...addressFields } = data.address;
      const hasAddressFields = Object.values(addressFields).some((v) => v !== undefined);

      if (hasAddressFields) {
        // Resolve effective city and state to validate the combination
        let effectiveCity  = addressFields.city;
        let effectiveState = addressFields.state;

        if (!effectiveCity || !effectiveState) {
          // Need to look up the existing address to fill in the missing half
          let sourceAddress = null;
          if (addressId) {
            sourceAddress = await addressRepository.findById(addressId);
            if (!sourceAddress || sourceAddress.customer_id !== id) {
              throw new NotFoundError('Address', addressId);
            }
          } else {
            const existing_addresses = await addressRepository.findByCustomerId(id);
            sourceAddress = existing_addresses[0] ?? null;
          }
          if (sourceAddress) {
            effectiveCity  = effectiveCity  ?? sourceAddress.city;
            effectiveState = effectiveState ?? sourceAddress.state;
          }
        }

        if (effectiveCity && effectiveState) {
          await validateCityState(effectiveCity, effectiveState);
        }
      }
    }

    return withTransaction(async (client) => {
      // Extract address from payload; update customer fields if any are present
      const { address: addressPayload, ...customerFields } = data;
      const hasCustomerFields = Object.values(customerFields).some((v) => v !== undefined);

      let updatedCustomer = existing;
      if (hasCustomerFields) {
        const result = await customerRepository.update(id, customerFields, client);
        if (!result) throw new NotFoundError('Customer', id);
        updatedCustomer = result;
        logger.info(`Customer updated: id=${id}`);
      }

      // Handle address update / creation
      if (addressPayload) {
        const { id: addressId, ...addressFields } = addressPayload;
        const hasAddressFields = Object.values(addressFields).some((v) => v !== undefined);

        if (hasAddressFields) {
          if (addressId) {
            // Update the specific address provided
            const updated = await addressRepository.update(addressId, addressFields, client);
            if (!updated || updated.customer_id !== id) {
              throw new NotFoundError('Address', addressId);
            }
            logger.info(`Address updated: id=${addressId}`);
          } else {
            // No id supplied — update first address or create if none
            const customerAddresses = await addressRepository.findByCustomerId(id);
            if (customerAddresses.length > 0) {
              await addressRepository.update(customerAddresses[0].id, addressFields, client);
              logger.info(`Address updated: id=${customerAddresses[0].id}`);
            } else {
              // All address fields must be present to create
              const { house_flat_number, building_street, locality_area, city, state, pin_code } =
                addressFields as Required<typeof addressFields>;
              await addressRepository.create(
                id,
                { house_flat_number, building_street, locality_area, city, state, pin_code },
                client
              );
              logger.info(`Address created for customer: id=${id}`);
            }
          }
        }
      }

      const addresses = await addressRepository.findByCustomerId(id);
      return { ...updatedCustomer, addresses };
    });
  },

  /**
   * Hard-deletes a customer and all their addresses (cascade via FK).
   */
  async deleteCustomer(id: number): Promise<void> {
    await withTransaction(async (client) => {
      const exists = await customerRepository.findById(id);
      if (!exists) {
        throw new NotFoundError('Customer', id);
      }
      await customerRepository.deleteById(id, client);
      logger.info(`Customer hard-deleted: id=${id}`);
    });
  },
};
