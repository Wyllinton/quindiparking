import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TokenService } from './token.service';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/auth-response.model';
import { UserDTO } from '../models/user.model';

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
      tap(response => this.tokenService.setToken(response.token))
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request).pipe(
      tap(response => this.tokenService.setToken(response.token))
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
}

