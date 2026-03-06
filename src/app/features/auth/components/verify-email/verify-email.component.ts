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
    // Also listen for queryParam changes
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
    if (!this.email) {
      this.notify.warning('No se encontró el correo electrónico. Inicia sesión de nuevo.');
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.email) return;
    this.loading = true;
    const code = this.form.value.code.trim();
    console.log('[VerifyEmail] Enviando verificación:', { email: this.email, code });
    this.authService.verifyEmail({ email: this.email, code }).subscribe({
      next: (res) => {
        console.log('[VerifyEmail] Respuesta exitosa:', res);
        this.loading = false;
        this.notify.success('Correo verificado exitosamente. Ahora puedes iniciar sesión.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        console.error('[VerifyEmail] Error completo:', err);
        console.error('[VerifyEmail] Status:', err.status);
        console.error('[VerifyEmail] Body:', err.error);
        this.loading = false;
        const msg = err.error?.message || err.error?.content || err.message || 'Código inválido o expirado';
        this.notify.error(msg);
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
        const msg = err.error?.message || err.error?.content || err.message || 'Error al reenviar el código';
        this.notify.error(msg);
      }
    });
  }
}

