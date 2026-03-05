# Instrucciones para el Fronte
# Flujo de autenticación con 2
# 1**Pantalla de Log**(`/logn
Cuando el usuario envía sus credenciales, el endpoin `POST /api/v1/auth/logn` ahora puede devolve**dos tipos de respues*
**Caso A: Sin 2FA habilita
n
{
"token": "eyJhbGciOiJIUzI1...",
"twoFactorRequired": false,
"email": "user@email.com",
"name": "Juan",
"role": "USER"
` → Guardar e `tokn` y redirigir a**dashboa** normalment
**Caso B: Con 2FA habilita
n
{
  "temporaryToken": "uuid-temporal-abc123",
  "twoFactorRequired": true,
  "email": "user@email.com",
  "message": "Two-factor authentication code sent to your email"
` **No guard** est `temporaryTokn` como token de sesión. Redirigir a l**pantalla de verificación 2*
**Lógica en el logi
t
const response = await fetch('/api/v1/auth/login', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email, password })
});

const data = await response.json();

if (data.twoFactorRequired) {
// Guardar temporalmente para la siguiente pantalla
sessionStorage.setItem('temp2faToken', data.temporaryToken);
sessionStorage.setItem('temp2faEmail', data.email);
navigate('/verify-2fa');
} else {
// Login normal
localStorage.setItem('token', data.token);
navigate('/dashboard');

# 2**Nueva Pantalla: Verificación 2**(`/verify-2a
Crear una nueva vista co
- Un mensaje *"Se ha enviado un código de verificación a tu corre
- U**inp** para el código de 6 dígit
- Un botó**"Verifica
- Opcionalmente un botó**"Reenviar códig
  **Al enviar el códig
  t
  const temporaryToken = sessionStorage.getItem('temp2faToken');
  const code = inputCode; // el código que ingresó el usuario

const response = await fetch('/api/v1/auth/verify-2fa', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ temporaryToken, code })
});

const data = await response.json();

if (response.ok) {
// Ahora sí tenemos el token real
localStorage.setItem('token', data.token);
sessionStorage.removeItem('temp2faToken');
sessionStorage.removeItem('temp2faEmail');
navigate('/dashboard');
} else {
showError('Código inválido o expirado');

# 3**Pantalla de Configuración/Perf** (existent
Agregar u**toggle/swit** para activar/desactivar la verificación en dos paso
- Label *"Verificación en dos paso
- Cuando el usuario lo active → llamar al endpoint correspondiente que actualic `twoFactorAuthEnabled = tre` en la cuen
- Cuando lo desactive `twoFactorAuthEnabled = fal

# Resumen de pantallas y accion
| Pantal
| Acci
| Endpoi

**Log
| Enviar credenciales, evaluar s `twoFactorRequird` e `tre` `fal
`POST /api/v1/auth/log

**Verify 2** (nuev
| Envia `temporaryTokn` `coe`, recibir token re
`POST /api/v1/auth/verify-2

**Perfil/Conf
| Toggle para activar/desactivar 2
| Endpoint de actualización de usuar


# Consideraciones de segurid
**No us* `localStorae` para e `temporaryTokn`, usa `sessionStorae` para que se borre al cerrar la pestañ
. E `temporaryTokn**no sir** para acceder a endpoints protegidos, solo para validar el 2F
. Si el usuario cierra la pestaña antes de verificar, debe volver a hacer logi
. El código tiene expiración (típicamente 5-10 minutos), mostrar un mensaje si expir
**Nun** mostrar e `temporaryTokn` al usuario, es solo para uso interno del fronten