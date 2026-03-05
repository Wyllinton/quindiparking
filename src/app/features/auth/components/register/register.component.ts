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
  selector: 'qp-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, AfterViewInit, OnDestroy {
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
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\- ]{7,15}$/)]]
    });
  }

  ngOnInit(): void {
    this.googleSub = this.googleAuthService.getIdToken().pipe(
      switchMap(idToken => this.authService.googleLogin({ idToken }))
    ).subscribe({
      next: (response) => this.handleAuthResponse(response),
      error: (err) => this.notify.error(err.error?.message || 'Error al registrarse con Google')
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

  onSubmit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.authService.register(this.form.value).subscribe({
      next: (response) => this.handleAuthResponse(response),
      error: (err) => {
        this.loading = false;
        this.notify.error(err.error?.message || 'Error al registrar');
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

    this.notify.success('Registro exitoso');
    this.router.navigate(['/dashboard']);
  }
}

