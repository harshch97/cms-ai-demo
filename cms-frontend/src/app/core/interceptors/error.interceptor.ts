import { Injectable } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler,
  HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private notification: NotificationService
  ) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            this.notification.error('Session expired. Please log in again.');
            this.authService.logout();
            break;
          case 403:
            this.notification.error('You are not authorised to perform this action.');
            break;
          case 404:
            this.notification.error('The requested resource was not found.');
            break;
          case 409:
            // Conflict errors (e.g. duplicate email) — let the component handle
            break;
          case 0:
          case 503:
            this.notification.error('Unable to reach the server. Check your connection.');
            break;
          case 500:
            this.notification.error('An unexpected server error occurred.');
            break;
          // 400 validation — let the component handle field-level errors
        }
        return throwError(() => error);
      })
    );
  }
}
