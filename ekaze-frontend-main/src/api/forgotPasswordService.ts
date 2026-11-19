import api from '@/lib/api';
import type {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from '@/types/forgotPassword.types';

export const authPasswordApi = {
  // POST /v1/auth/password/forgot  → body: { phone }
  forgotPassword: async (data: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>('/auth/password/forgot', {
      phone: data.login, // backend expects "phone" field
    });
    return response.data;
  },

  // POST /v1/auth/password/reset   → body: { phone, otp_code, password, password_confirmation }
  resetPassword: async (data: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
    const response = await api.post<ResetPasswordResponse>('/auth/password/reset', data);
    return response.data;
  },
};