import api from '@/lib/api';

import type {
  WorkerRegistrationRequest,
  EmployerRegistrationRequest,
  CompanyRegistrationRequest,
  RegistrationResponse,
  WorkerRegistrationData,
  EmployerRegistrationData,
  CompanyRegistrationData,
  LoginRequest,
  LoginResponse,
  UserProfile,
  OtpVerificationRequest,
  OtpVerificationResponse,
  OtpResendRequest,
  OtpResendResponse,
} from '@/types/auth.types';


export interface ForgotPasswordRequest {
  phone: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    phone: string;
    expires_in: string;
  };
}

export interface ResetPasswordRequest {
  phone: string;
  otp_code: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export const authApi = {
  // Login
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  },

  // Google Login
  googleLogin: async (data: { google_id?: string; google_email?: string; email?: string; name?: string; profile_photo?: string; role?: string }): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/google', data);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

// Register Worker
  registerWorker: async (data: WorkerRegistrationRequest): Promise<RegistrationResponse<WorkerRegistrationData>> => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      if (key === 'photo') {
        // only append if it's an actual File — skip null/undefined (already guarded above)
        if (value instanceof File) formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, String(item));
        });
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await api.post<RegistrationResponse<WorkerRegistrationData>>(
      '/auth/register/worker',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // Register Employer
  registerEmployer: async (data: EmployerRegistrationRequest): Promise<RegistrationResponse<EmployerRegistrationData>> => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await api.post<RegistrationResponse<EmployerRegistrationData>>(
      '/auth/register/employer', 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Register Company
  registerCompany: async (data: CompanyRegistrationRequest): Promise<RegistrationResponse<CompanyRegistrationData>> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    });

    const response = await api.post<RegistrationResponse<CompanyRegistrationData>>(
      '/auth/register/company', 
      formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },


  
  verifyOtp: async (data: OtpVerificationRequest): Promise<OtpVerificationResponse> => {
  const response = await api.post<OtpVerificationResponse>('/auth/otp/verify', data);
  return response.data;
},

// Resend OTP
resendOtp: async (data: OtpResendRequest): Promise<OtpResendResponse> => {
  const response = await api.post<OtpResendResponse>('/auth/otp/resend', data);
  return response.data;
},

  // Forgot Password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
    return response.data;
  },

  // Reset Password
  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await api.post<ResetPasswordResponse>('/auth/reset-password', data);
    return response.data;
  },

  // Set Initial / First Login Password
  setInitialPassword: async (data: { new_password: string; confirm_password: string }): Promise<{ success: boolean; message: string; user?: any }> => {
    const response = await api.post<{ success: boolean; message: string; user?: any }>('/auth/set-initial-password', data);
    return response.data;
  },

  // Get current user
  me: async (): Promise<{ success: boolean; user: UserProfile }> => {
    const response = await api.get<{ success: boolean; user: UserProfile }>('/auth/me');
    return response.data;
  },

  // Update profile & profile photo
  updateProfile: async (data: { name?: string; username?: string; phone?: string; email?: string; profile_photo?: string; google_id?: string | null; google_email?: string | null }): Promise<{ success: boolean; user: UserProfile }> => {
    const response = await api.put<{ success: boolean; user: UserProfile }>('/auth/profile', data);
    return response.data;
  },

  // Verification Code (Phone / Email OTP for registration & profile verification)
  sendVerificationCode: async (data: { type: 'phone' | 'email'; target: string }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/send-verification-code', data);
    return response.data;
  },

  verifyVerificationCode: async (data: { type: 'phone' | 'email'; target: string; code: string }): Promise<{ success: boolean; verified: boolean; message?: string }> => {
    const response = await api.post('/auth/verify-verification-code', data);
    return response.data;
  },

  // Active Device Sessions
  getSessions: async (): Promise<{
    success: boolean;
    sessions: Array<{
      id: string;
      os: string;
      deviceName?: string;
      browser: string;
      ip: string;
      is_current: boolean;
      last_session: string;
      created_at: string;
    }>;
    count: number;
    max_devices: number;
  }> => {
    const response = await api.get('/auth/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: string): Promise<{ success: boolean; is_current?: boolean; message: string }> => {
    const response = await api.delete(`/auth/sessions/${sessionId}`);
    return response.data;
  },
};