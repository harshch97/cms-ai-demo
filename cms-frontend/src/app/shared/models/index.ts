// ─── Customer ────────────────────────────────────────────

export interface Customer {
  id: number;
  full_name: string;
  company_name: string;
  phone_number: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerWithAddresses extends Customer {
  addresses: Address[];
}

export interface CreateCustomerDto {
  full_name: string;
  company_name: string;
  phone_number: string;
  email: string;
  address: CreateAddressDto;
}

export interface UpdateCustomerDto {
  full_name?: string;
  company_name?: string;
  phone_number?: string;
  email?: string;
  address?: UpdateAddressDto & { id?: number };
}

// ─── Address ─────────────────────────────────────────────

export interface Address {
  id: number;
  customer_id: number;
  house_flat_number: string;
  building_street: string;
  locality_area: string;
  city: string;
  state: string;
  pin_code: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressDto {
  house_flat_number: string;
  building_street: string;
  locality_area: string;
  city: string;
  state: string;
  pin_code: string;
}

export interface UpdateAddressDto {
  house_flat_number?: string;
  building_street?: string;
  locality_area?: string;
  city?: string;
  state?: string;
  pin_code?: string;
}

// ─── Reference ───────────────────────────────────────────

export interface ReferenceItem {
  id: number;
  name: string;
}

export interface CityItem {
  id: number;
  name: string;
  state_id: number;
}

// ─── Auth ────────────────────────────────────────────────

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

// ─── API wrappers ─────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: FieldError[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}
