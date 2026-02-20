import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { ApiResponse, ReferenceItem, CityItem } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class ReferenceService {
  private readonly baseUrl = `${environment.apiBaseUrl}/reference`;

  private states$?: Observable<ApiResponse<ReferenceItem[]>>;

  constructor(private http: HttpClient) {}

  /** GET /reference/states — cached with shareReplay */
  getStates(): Observable<ApiResponse<ReferenceItem[]>> {
    if (!this.states$) {
      this.states$ = this.http
        .get<ApiResponse<ReferenceItem[]>>(`${this.baseUrl}/states`)
        .pipe(shareReplay(1));
    }
    return this.states$;
  }

  /** GET /reference/states/:stateId/cities */
  getCitiesByState(stateId: number): Observable<ApiResponse<CityItem[]>> {
    return this.http.get<ApiResponse<CityItem[]>>(
      `${this.baseUrl}/states/${stateId}/cities`
    );
  }
}
