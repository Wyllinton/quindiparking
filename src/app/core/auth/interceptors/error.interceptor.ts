import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  // Public auth endpoints where 401/403 should be handled by the component, not the interceptor
  private readonly publicAuthPaths = [
    '/auth/login',
    '/auth/register',
    '/auth/verify-email',
    '/auth/resend-email-code',
    '/auth/verify-2fa',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/google'
  ];

  constructor(
    private router: Router,
    private tokenService: TokenService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const isPublicAuth = this.publicAuthPaths.some(path => req.url.endsWith(path));
        // Only force logout on 401 (invalid/expired token), NOT 403 (forbidden by role)
        if (error.status === 401 && !isPublicAuth) {
          this.tokenService.removeToken();
          this.router.navigate(['/auth/login']);
        }
        return throwError(() => error);
      })
    );
  }
}

