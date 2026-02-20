export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: FieldValidationError[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FieldValidationError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
}

export interface ReferenceItem {
  id: number;
  name: string;
}

export interface CityItem {
  id: number;
  name: string;
  state_id: number;
}
