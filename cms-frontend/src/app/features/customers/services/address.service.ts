import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, Address, CreateAddressDto, UpdateAddressDto } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private readonly baseUrl = `${environment.apiBaseUrl}`;

  constructor(private http: HttpClient) {}

  /** GET /customers/:id/addresses */
  getAddresses(customerId: number): Observable<ApiResponse<Address[]>> {
    return this.http.get<ApiResponse<Address[]>>(
      `${this.baseUrl}/customers/${customerId}/addresses`
    );
  }

  /** POST /customers/:id/addresses */
  createAddress(customerId: number, dto: CreateAddressDto): Observable<ApiResponse<Address>> {
    return this.http.post<ApiResponse<Address>>(
      `${this.baseUrl}/customers/${customerId}/addresses`,
      dto
    );
  }

  /**
   * PUT /addresses/:addressId
   * Standalone update for addresses accessible from detail view.
   */
  updateAddress(addressId: number, dto: UpdateAddressDto): Observable<ApiResponse<Address>> {
    return this.http.put<ApiResponse<Address>>(
      `${this.baseUrl}/addresses/${addressId}`,
      dto
    );
  }

  /** DELETE /addresses/:addressId */
  deleteAddress(addressId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.baseUrl}/addresses/${addressId}`
    );
  }
}
