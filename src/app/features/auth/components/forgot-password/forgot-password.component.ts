import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'qp-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notify: NotificationService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    const email = this.form.value.email;

    this.authService.forgotPassword({ email }).subscribe({
      next: () => {
        this.notify.success('Se ha enviado un código de recuperación a tu correo');
        this.router.navigate(['/auth/reset-password'], {
          queryParams: { email }
        });
      },
      error: (err) => {
        this.loading = false;
        this.notify.error(err.error?.message || 'Error al enviar el código de recuperación');
      }
    });
  }
}

