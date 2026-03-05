import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TokenService } from './token.service';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ChangePasswordAuthenticatedRequest,
  ForgotPasswordRequest,
  PasswordResetVerificationRequest,
  EmailVerificationRequest,
  TwoFactorVerifyRequest,
  GoogleAuthRequest
} from '../models/auth-response.model';
import { UserDTO } from '../models/user.model';
import { ResponseDTO } from '../../../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(response => {
        // Only store token if 2FA is NOT required
        if (!response.twoFactorRequired && response.token) {
          this.tokenService.setToken(response.token);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request).pipe(
      tap(response => {
        if (response.token) {
          this.tokenService.setToken(response.token);
        }
      })
    );
  }

  getCurrentUser(): Observable<UserDTO> {
    return this.http.get<UserDTO>(`${this.apiUrl}/auth/me`);
  }

  logout(): Observable<string> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { responseType: 'text' }).pipe(
      tap(() => this.tokenService.removeToken())
    );
  }

  isAuthenticated(): boolean {
    return this.tokenService.isLoggedIn();
  }

  // --- Change Password (authenticated) ---
  changePassword(request: ChangePasswordAuthenticatedRequest): Observable<ResponseDTO<string>> {
    return this.http.put<ResponseDTO<string>>(`${this.apiUrl}/auth/change-password`, request);
  }

  // --- Forgot Password ---
  forgotPassword(request: ForgotPasswordRequest): Observable<ResponseDTO<string>> {
    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}/auth/forgot-password`, request);
  }

  // --- Reset Password with Code ---
  resetPassword(request: PasswordResetVerificationRequest): Observable<ResponseDTO<string>> {
    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}/auth/reset-password`, request);
  }

  // --- Email Verification ---
  verifyEmail(request: EmailVerificationRequest): Observable<ResponseDTO<string>> {
    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}/auth/verify-email`, request);
  }

  // --- Resend Email Verification Code ---
  resendEmailVerificationCode(request: ForgotPasswordRequest): Observable<ResponseDTO<string>> {
    return this.http.post<ResponseDTO<string>>(`${this.apiUrl}/auth/resend-email-code`, request);
  }

  // --- Two-Factor Authentication ---
  verifyTwoFactorCode(request: TwoFactorVerifyRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/verify-2fa`, request).pipe(
      tap(response => {
        if (response.token) {
          this.tokenService.setToken(response.token);
        }
      })
    );
  }

  // --- Google Auth ---
  googleLogin(request: GoogleAuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/google`, request).pipe(
      tap(response => {
        if (!response.twoFactorRequired && response.token) {
          this.tokenService.setToken(response.token);
        }
      })
    );
  }
}

