import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { UserDTO, CreateUserDTO, PasswordChangeRequest, UpdateUserActiveStatusDTO } from '../../core/auth/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService {

  // ──── CRUD ────

  createUser(user: CreateUserDTO): Observable<UserDTO> {
    return this.post<UserDTO>('/users', user);
  }

  getAllUsers(): Observable<UserDTO[]> {
    return this.get<UserDTO[]>('/users');
  }

  getUserById(id: number): Observable<UserDTO> {
    return this.get<UserDTO>(`/users/${id}`);
  }

  updateUser(id: number, user: UserDTO): Observable<UserDTO> {
    return this.put<UserDTO>(`/users/${id}`, user);
  }

  deleteUser(id: number): Observable<void> {
    return this.delete<void>(`/users/${id}`);
  }

  // ──── Profile ────

  getMyProfile(): Observable<UserDTO> {
    return this.get<UserDTO>('/users/me/profile');
  }

  // ──── Password ────

  changePassword(id: number, request: PasswordChangeRequest): Observable<void> {
    return this.post<void>(`/users/${id}/change-password`, request);
  }

  // ──── Activation ────

  activateUser(id: number, dto: UpdateUserActiveStatusDTO): Observable<UserDTO> {
    return this.patch<UserDTO>(`/users/${id}/activate`, dto);
  }
}

