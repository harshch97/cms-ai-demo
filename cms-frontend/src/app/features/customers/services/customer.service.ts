import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  ApiResponse, PaginatedResponse, CustomerWithAddresses,
  CreateCustomerDto, UpdateCustomerDto
} from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly baseUrl = `${environment.apiBaseUrl}/customers`;

  constructor(private http: HttpClient) {}

  /** GET /customers?page=&limit=&search= */
  getCustomers(page = 1, limit = 10, search = ''): Observable<ApiResponse<PaginatedResponse<CustomerWithAddresses>>> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit);
    if (search?.trim()) params = params.set('search', search.trim());

    return this.http.get<ApiResponse<PaginatedResponse<CustomerWithAddresses>>>(this.baseUrl, { params });
  }

  /** GET /customers/:id */
  getCustomerById(id: number): Observable<ApiResponse<CustomerWithAddresses>> {
    return this.http.get<ApiResponse<CustomerWithAddresses>>(`${this.baseUrl}/${id}`);
  }

  /**
   * POST /customers — creates customer + address atomically.
   * Payload must include a nested `address` object.
   */
  createCustomer(dto: CreateCustomerDto): Observable<ApiResponse<CustomerWithAddresses>> {
    return this.http.post<ApiResponse<CustomerWithAddresses>>(this.baseUrl, dto);
  }

  /**
   * PUT /customers/:id — updates customer and/or address atomically.
   * Address is optional. Include address.id to target a specific address.
   */
  updateCustomer(id: number, dto: UpdateCustomerDto): Observable<ApiResponse<CustomerWithAddresses>> {
    return this.http.put<ApiResponse<CustomerWithAddresses>>(`${this.baseUrl}/${id}`, dto);
  }

  /** DELETE /customers/:id */
  deleteCustomer(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}
