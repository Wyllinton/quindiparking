import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../../shared/services/user.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserDTO } from '../../../../core/auth/models/user.model';

@Component({
  selector: 'qp-account-page',
  standalone: false,
  templateUrl: './account-page.component.html',
  styleUrl: './account-page.component.scss'
})
export class AccountPageComponent implements OnInit {

  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  user: UserDTO | null = null;
  twoFactorEnabled = false;
  toggling2FA = false;

  savingProfile = false;
  savingPassword = false;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();
    this.load2FAStatus();
  }

  private initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\- ]{7,15}$/)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!#%*?&]).+$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  private loadProfile(): void {
    this.loading = true;
    this.userService.getMyProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber
        });
        this.loading = false;
      },
      error: () => {
        this.notify.error('Error al cargar el perfil');
        this.loading = false;
      }
    });
  }

  private load2FAStatus(): void {
    this.authService.get2FAStatus().subscribe({
      next: (res) => {
        this.twoFactorEnabled = res.content.twoFactorAuthEnabled;
      },
      error: () => {}
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    if (!this.user) return;

    this.savingProfile = true;
    const dto = this.profileForm.value;

    this.userService.updateProfile(this.user.id, dto).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.notify.success('Perfil actualizado correctamente');
        this.savingProfile = false;
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Error al actualizar el perfil');
        this.savingProfile = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.notify.error('Las contraseñas no coinciden');
      return;
    }

    this.savingPassword = true;
    this.authService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.notify.success('Contraseña cambiada correctamente');
        this.passwordForm.reset();
        this.savingPassword = false;
      },
      error: (err) => {
        this.notify.error(err.error?.message || 'Error al cambiar la contraseña');
        this.savingPassword = false;
      }
    });
  }

  toggle2FA(): void {
    const newState = !this.twoFactorEnabled;
    this.toggling2FA = true;

    this.authService.toggle2FA(newState).subscribe({
      next: (res) => {
        this.twoFactorEnabled = res.content.twoFactorAuthEnabled;
        const msg = this.twoFactorEnabled
          ? 'Autenticación en dos pasos activada'
          : 'Autenticación en dos pasos desactivada';
        this.notify.success(msg);
        this.toggling2FA = false;
      },
      error: () => {
        this.notify.error('Error al cambiar el estado de 2FA');
        this.toggling2FA = false;
      }
    });
  }

  // ── Form helpers ──

  isInvalid(form: FormGroup, field: string): boolean {
    const control = form.get(field);
    return !!control && control.invalid && control.touched;
  }

  get passwordsMismatch(): boolean {
    const { newPassword, confirmPassword } = this.passwordForm.value;
    return confirmPassword && newPassword !== confirmPassword;
  }

  get newPasswordValue(): string {
    return this.passwordForm.get('newPassword')?.value || '';
  }

  get pwHasMinLength(): boolean { return this.newPasswordValue.length >= 8; }
  get pwHasUppercase(): boolean { return /[A-Z]/.test(this.newPasswordValue); }
  get pwHasLowercase(): boolean { return /[a-z]/.test(this.newPasswordValue); }
  get pwHasNumber(): boolean { return /\d/.test(this.newPasswordValue); }
  get pwHasSpecial(): boolean { return /[@$!#%*?&]/.test(this.newPasswordValue); }
}

