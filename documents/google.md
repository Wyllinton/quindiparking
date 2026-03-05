PasoQuiénQué hace1UsuarioHace clic en "Login con Google"2AngularRedirige a Google OAuth3GoogleAutentica y retorna idToken4AngularEnvía el idToken al backend

app.config.ts o app.module.ts
typescriptimport { SocialLoginModule, SocialAuthServiceConfig, GoogleLoginProvider } from '@abacritt/angularx-social-login';

providers: [
{
provide: 'SocialAuthServiceConfig',
useValue: {
autoLogin: false,
providers: [
{
id: GoogleLoginProvider.PROVIDER_ID,
provider: new GoogleLoginProvider('TU_GOOGLE_CLIENT_ID')
}
]
} as SocialAuthServiceConfig
}
]
auth.service.ts
typescript@Injectable({ providedIn: 'root' })
export class AuthService {
constructor(
private socialAuth: SocialAuthService,
private http: HttpClient
) {}

loginWithGoogle(): void {
this.socialAuth.signIn(GoogleLoginProvider.PROVIDER_ID);
}

// Escucha cuando Google retorna el usuario
handleGoogleLogin(): Observable<any> {
return this.socialAuth.authState.pipe(
filter(user => !!user),
switchMap(user =>
// Envía el idToken de Google a tu backend
this.http.post('/api/auth/google', { idToken: user.idToken })
)
);
}
}
login.component.ts
typescriptexport class LoginComponent implements OnInit {
constructor(private authService: AuthService, private router: Router) {}

ngOnInit() {
// Escucha la respuesta de Google
this.authService.handleGoogleLogin().subscribe({
next: (response) => {
localStorage.setItem('token', response.token); // JWT de tu backend
this.router.navigate(['/dashboard']);
},
error: (err) => console.error(err)
});
}

loginGoogle() {
this.authService.loginWithGoogle();
}
}
html<!-- login.component.html -->
<button (click)="loginGoogle()">
Iniciar sesión con Google
</button>
