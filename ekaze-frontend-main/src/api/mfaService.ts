import api from '@/lib/api';

export interface MfaStatusResponse {
  success: boolean;
  data: {
    mfa_enabled: boolean;
    mfa_method: 'authenticator' | 'sms' | 'email';
    phone: string;
    email: string;
  };
}

export interface MfaSetupResponse {
  success: boolean;
  message: string;
  data: {
    method: 'authenticator' | 'sms' | 'email';
    secret: string;
    qr_code_uri: string;
    phone: string;
    email: string;
  };
}

export const mfaService = {
  // Get MFA Status
  getStatus: async (): Promise<MfaStatusResponse> => {
    const res = await api.get('/auth/mfa/status');
    return res.data;
  },

  // Setup / Initialize MFA for selected method
  setup: async (method: 'authenticator' | 'sms' | 'email'): Promise<MfaSetupResponse> => {
    const res = await api.post('/auth/mfa/setup', { method });
    return res.data;
  },

  // Verify and Activate MFA
  verify: async (code: string, method: 'authenticator' | 'sms' | 'email') => {
    const res = await api.post('/auth/mfa/verify', { code, method });
    return res.data;
  },

  // Send / Resend verification code during setup
  sendCode: async (method: 'authenticator' | 'sms' | 'email') => {
    const res = await api.post('/auth/mfa/send-code', { method });
    return res.data;
  },

  // Verify Login MFA
  verifyLoginMfa: async (temp_token: string, code: string) => {
    const res = await api.post('/auth/login/verify-mfa', { temp_token, code });
    return res.data;
  },

  // Resend Login MFA code (for email / sms)
  resendLoginMfa: async (temp_token: string) => {
    const res = await api.post('/auth/login/resend-mfa', { temp_token });
    return res.data;
  },

  // Disable MFA
  disable: async () => {
    const res = await api.post('/auth/mfa/disable');
    return res.data;
  },
};
