import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  // Public auth endpoints that should NOT send the Authorization header
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

  constructor(private tokenService: TokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Don't attach token to public auth endpoints
    const isPublicAuth = this.publicAuthPaths.some(path => req.url.endsWith(path));
    if (isPublicAuth) {
      return next.handle(req);
    }

    const token = this.tokenService.getToken();

    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned);
    }

    return next.handle(req);
  }
}

