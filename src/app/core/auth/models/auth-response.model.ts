export interface LoginRequest {
  email: string;
  password: string;
  recaptchaToken: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  recaptchaToken: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  token: string;
  twoFactorRequired: boolean;
  temporaryToken: string | null;
}

// --- Change Password (authenticated) ---
export interface ChangePasswordAuthenticatedRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// --- Forgot Password ---
export interface ForgotPasswordRequest {
  email: string;
}

// --- Reset Password with Code ---
export interface PasswordResetVerificationRequest {
  email: string;
  code: string;
  newPassword: string;
  confirmPassword: string;
}

// --- Email Verification ---
export interface EmailVerificationRequest {
  email: string;
  code: string;
}

// --- Two-Factor Authentication ---
export interface TwoFactorVerifyRequest {
  temporaryToken: string;
  code: string;
}

// --- Google Auth ---
export interface GoogleAuthRequest {
  idToken: string;
}

