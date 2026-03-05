import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'qp-verify-2fa',
  standalone: false,
  templateUrl: './verify-2fa.component.html',
  styleUrl: './verify-2fa.component.scss'
})
export class Verify2faComponent implements OnInit {
  form: FormGroup;
  loading = false;
  email = '';

  private temporaryToken = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notify: NotificationService
  ) {
    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
  }

  ngOnInit(): void {
    this.temporaryToken = sessionStorage.getItem('temp2faToken') || '';
    this.email = sessionStorage.getItem('temp2faEmail') || '';

    if (!this.temporaryToken) {
      this.notify.warning('Sesión expirada. Inicia sesión de nuevo.');
      this.router.navigate(['/auth/login']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || !this.temporaryToken) return;
    this.loading = true;

    this.authService.verifyTwoFactorCode({
      temporaryToken: this.temporaryToken,
      code: this.form.value.code
    }).subscribe({
      next: () => {
        sessionStorage.removeItem('temp2faToken');
        sessionStorage.removeItem('temp2faEmail');
        this.notify.success('Verificación exitosa');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.notify.error(err.error?.message || 'Código inválido o expirado');
      }
    });
  }
}

