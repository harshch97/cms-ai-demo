export interface Address {
  id: number;
  customer_id: number;
  house_flat_number: string;
  building_street: string;
  locality_area: string;
  city: string;
  state: string;
  pin_code: string;
  created_at: Date;
  updated_at: Date;
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
