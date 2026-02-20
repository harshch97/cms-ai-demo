import { Address, CreateAddressDto, UpdateAddressDto } from './address.types';

export interface Customer {
  id: number;
  full_name: string;
  company_name: string;
  phone_number: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface CustomerWithAddresses extends Customer {
  addresses: Address[];
}

/** Used for POST /customers — address is required on creation */
export interface CreateCustomerDto {
  full_name: string;
  company_name: string;
  phone_number: string;
  email: string;
  address: CreateAddressDto;
}

/**
 * Used for PUT /customers/:id
 * address is optional — if provided, the matching address (by address.id) is
 * updated; if address.id is omitted, the customer's first address is updated,
 * or a new one is created if none exist.
 */
export interface UpdateCustomerDto {
  full_name?: string;
  company_name?: string;
  phone_number?: string;
  email?: string;
  address?: UpdateAddressDto & { id?: number };
}

