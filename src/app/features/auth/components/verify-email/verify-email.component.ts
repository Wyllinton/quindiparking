import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'qp-verify-email',
  standalone: false,
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {
  form: FormGroup;
  loading = false;
  resending = false;
  email = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notify: NotificationService
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || '';
    if (!this.email) {
      this.notify.warning('No se encontró el correo electrónico. Inicia sesión de nuevo.');
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.email) return;
    this.loading = true;
    this.authService.verifyEmail({ email: this.email, code: this.form.value.code }).subscribe({
      next: () => {
        this.notify.success('Correo verificado exitosamente. Ahora puedes iniciar sesión.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading = false;
        this.notify.error(err.error?.message || 'Código inválido o expirado');
      }
    });
  }

  resendCode(): void {
    if (!this.email || this.resending) return;
    this.resending = true;
    this.authService.resendEmailVerificationCode({ email: this.email }).subscribe({
      next: () => {
        this.resending = false;
        this.notify.success('Se ha reenviado el código de verificación a tu correo');
      },
      error: (err) => {
        this.resending = false;
        this.notify.error(err.error?.message || 'Error al reenviar el código');
      }
    });
  }
}

