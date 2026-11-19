// ─── Forgot Password ─────────────────────────────────────────────────────────

export interface ForgotPasswordPayload {
  login: string; // phone or email — frontend normalises to phone before sending
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    phone: string;       // masked e.g. "0788XXX"
    expires_in: string;  // "10 minutes"
  };
}

// ─── Reset Password (OTP-based) ───────────────────────────────────────────────

export interface ResetPasswordPayload {
  phone: string;                 // normalised Rwandan phone
  otp_code: string;              // 6-digit OTP from SMS
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}