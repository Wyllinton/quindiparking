import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { GoogleAuthService } from '../../../../core/auth/services/google-auth.service';
import { AuthResponse } from '../../../../core/auth/models/auth-response.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'qp-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  form: FormGroup;
  loading = false;

  @ViewChild('googleBtn') googleBtnRef!: ElementRef;
  private googleSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router,
    private notify: NotificationService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Listen for Google ID token and send to backend
    this.googleSub = this.googleAuthService.getIdToken().pipe(
      switchMap(idToken => this.authService.googleLogin({ idToken }))
    ).subscribe({
      next: (response) => this.handleAuthResponse(response),
      error: (err) => this.notify.error(err.error?.message || 'Error al iniciar sesión con Google')
    });
  }

  ngAfterViewInit(): void {
    // Render Google button after the view is initialized
    if (this.googleBtnRef) {
      this.googleAuthService.renderButton(this.googleBtnRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.googleSub?.unsubscribe();
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.authService.login(this.form.value).subscribe({
      next: (response) => this.handleAuthResponse(response),
      error: (err) => {
        this.loading = false;
        this.notify.error(err.error?.message || 'Credenciales inválidas');
      }
    });
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (response.twoFactorRequired) {
      sessionStorage.setItem('temp2faToken', response.temporaryToken || '');
      sessionStorage.setItem('temp2faEmail', response.email);
      this.notify.info('Se ha enviado un código de verificación a tu correo');
      this.router.navigate(['/auth/verify-2fa']);
      return;
    }

    this.notify.success('Inicio de sesión exitoso');
    this.router.navigate(['/dashboard']);
  }
}

