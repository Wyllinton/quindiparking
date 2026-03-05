import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'qp-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  email = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notify: NotificationService
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || '';
    if (!this.email) {
      this.notify.warning('No se encontró el correo electrónico. Solicita el código de nuevo.');
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  get passwordsMismatch(): boolean {
    const { newPassword, confirmPassword } = this.form.value;
    return confirmPassword && newPassword !== confirmPassword;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.email) return;

    const { newPassword, confirmPassword } = this.form.value;
    if (newPassword !== confirmPassword) {
      this.notify.error('Las contraseñas no coinciden');
      return;
    }

    this.loading = true;
    this.authService.resetPassword({
      email: this.email,
      code: this.form.value.code,
      newPassword,
      confirmPassword
    }).subscribe({
      next: () => {
        this.notify.success('Contraseña restablecida exitosamente. Inicia sesión con tu nueva contraseña.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        this.notify.error(err.error?.message || 'Error al restablecer la contraseña');
      }
    });
  }
}

