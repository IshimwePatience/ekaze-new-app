import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import { authPasswordApi } from '@/api/forgotPasswordService';
import type {
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
} from '@/types/forgotPassword.types';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// ─── useForgotPassword ────────────────────────────────────────────────────────

export const useForgotPassword = () => {
  const { toast } = useToast();

  return useMutation<ForgotPasswordResponse, AxiosError<ApiErrorResponse>, ForgotPasswordPayload>({
    mutationFn: (data) => authPasswordApi.forgotPassword(data),
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Failed to send OTP';

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

// ─── useResetPassword ─────────────────────────────────────────────────────────

export const useResetPassword = () => {
  const { toast } = useToast();

  return useMutation<ResetPasswordResponse, AxiosError<ApiErrorResponse>, ResetPasswordPayload>({
    mutationFn: (data) => authPasswordApi.resetPassword(data),
    onError: (error) => {
      const errors   = error.response?.data?.errors;
      const detail   = error.response?.data?.error;
      const message  = error.response?.data?.message || error.message || 'Failed to reset password';

      toast({
        title: 'Reset Failed',
        description: errors
          ? Object.values(errors).flat().join(', ')
          : detail
          ? `${message}: ${detail}`
          : message,
        variant: 'destructive',
      });
    },
  });
};