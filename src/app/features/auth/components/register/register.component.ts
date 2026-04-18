import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { GoogleAuthService } from '../../../../core/auth/services/google-auth.service';
import { AuthResponse } from '../../../../core/auth/models/auth-response.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'qp-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, AfterViewInit, OnDestroy {
  form: FormGroup;
  loading = false;
  showTermsModal = false;
  showPrivacyModal = false;
  private pendingGoogleToken: string | null = null;

  @ViewChild('googleBtn') googleBtnRef!: ElementRef;
  private googleSub?: Subscription;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private recaptchaV3Service: ReCaptchaV3Service,
    private router: Router,
    private notify: NotificationService
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(100),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!#%*?&]).+$/)
      ]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\- ]{7,15}$/)]],
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.googleSub = this.googleAuthService.getIdToken().subscribe({
      next: (idToken) => {
        if (!this.form.get('acceptTerms')?.value) {
          this.pendingGoogleToken = idToken;
          this.form.get('acceptTerms')?.markAsTouched();
          this.notify.warning('Debes aceptar los Términos y Condiciones y la Política de Privacidad antes de registrarte con Google');
          return;
        }
        this.processGoogleLogin(idToken);
      },
      error: (err) => this.notify.error(err.error?.message || 'Error al registrarse con Google')
    });

    this.form.get('acceptTerms')?.valueChanges.subscribe(accepted => {
      if (accepted && this.pendingGoogleToken) {
        this.processGoogleLogin(this.pendingGoogleToken);
        this.pendingGoogleToken = null;
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.googleBtnRef) {
      this.googleAuthService.renderButton(this.googleBtnRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.googleSub?.unsubscribe();
  }

  get passwordValue(): string {
    return this.form.get('password')?.value || '';
  }

  get hasMinLength(): boolean {
    return this.passwordValue.length >= 8;
  }

  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.passwordValue);
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.passwordValue);
  }

  get hasNumber(): boolean {
    return /\d/.test(this.passwordValue);
  }

  get hasSpecialChar(): boolean {
    return /[@$!#%*?&]/.test(this.passwordValue);
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;

    this.recaptchaV3Service.execute('register').subscribe({
      next: (recaptchaToken) => {
        const { acceptTerms, ...formData } = this.form.value;
        const registerData = { ...formData, recaptchaToken };
        this.authService.register(registerData).subscribe({
          next: (response) => this.handleAuthResponse(response),
          error: (err) => {
            this.loading = false;
            this.notify.error(err.error?.message || 'Error al registrar');
          }
        });
      },
      error: () => {
        this.loading = false;
        this.notify.error('Error al verificar reCAPTCHA. Intenta de nuevo.');
      }
    });
  }

  openTermsModal(event: Event): void {
    event.preventDefault();
    this.showTermsModal = true;
  }

  closeTermsModal(): void {
    this.showTermsModal = false;
  }

  openPrivacyModal(event: Event): void {
    event.preventDefault();
    this.showPrivacyModal = true;
  }

  closePrivacyModal(): void {
    this.showPrivacyModal = false;
  }

  private processGoogleLogin(idToken: string): void {
    this.loading = true;
    this.authService.googleLogin({ idToken }).subscribe({
      next: (response) => this.handleAuthResponse(response),
      error: (err) => {
        this.loading = false;
        this.notify.error(err.error?.message || 'Error al registrarse con Google');
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

    this.notify.success('Registro exitoso. Inicia sesión para continuar.');
    this.router.navigate(['/auth/login']);
  }
}
