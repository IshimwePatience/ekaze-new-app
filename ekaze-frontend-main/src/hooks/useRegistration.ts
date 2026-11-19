import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/authApi';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import type {
  WorkerRegistrationRequest,
  EmployerRegistrationRequest,
  CompanyRegistrationRequest,
  RegistrationResponse,
  WorkerRegistrationData,
  EmployerRegistrationData,
  CompanyRegistrationData,
  OtpVerificationRequest,
  OtpVerificationResponse,
  OtpResendRequest,
  OtpResendResponse,
} from '@/types/auth.types';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export const useRegisterWorker = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation <
    RegistrationResponse<WorkerRegistrationData>, 
    AxiosError<ErrorResponse>, 
    WorkerRegistrationRequest
  >({
    mutationFn: (data) => authApi.registerWorker(data),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: 'Registration successful! Continue with payment to complete your profile.',
      });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Registration failed';
      const errorDetail = error?.response?.data?.error;  // ADD THIS
      const errors = error?.response?.data?.errors;

      toast({
        title: 'Registration Failed',
        description: errors 
          ? Object.values(errors).flat().join(', ')
          : errorDetail  // SHOW ERROR DETAIL IF NO VALIDATION ERRORS
            ? `${errorMessage}: ${errorDetail}`
            : errorMessage,
        variant: 'destructive',
      });
    },
  });
};




export const useRegistrationPrefill = () =>
  useMutation({
    mutationFn: async (nid: string) => {
      const r = await api.get(`/registration/prefill/${nid}`);
      return r.data;
    },
    onError: () => {},
  });

export const useRegisterEmployer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation<
    RegistrationResponse<EmployerRegistrationData>, 
    AxiosError<ErrorResponse>, 
    EmployerRegistrationRequest
  >({
    mutationFn: (data) => authApi.registerEmployer(data),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: 'Registration successful! Continue with payment to complete your profile.',
      });
      
      // Don't navigate to /payment
      // Let the form component handle payment modal display
    },
  onError: (error) => {
    const errorMessage = error?.response?.data?.message || 'Registration failed';
    const errorDetail = error?.response?.data?.error;
    const errors = error?.response?.data?.errors;

    toast({
      title: 'Registration Failed',
      description: errors 
        ? Object.values(errors).flat().join(', ')
        : errorDetail
          ? `${errorMessage}: ${errorDetail}`
          : errorMessage,
      variant: 'destructive',
    });
  },
  });
};

export const useRegisterCompany = () => {
  const { toast } = useToast();

  return useMutation<
    RegistrationResponse<CompanyRegistrationData>, 
    AxiosError<ErrorResponse>, 
    CompanyRegistrationRequest
  >({
    mutationFn: (data) => authApi.registerCompany(data),
    onSuccess: (response) => {
toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Company registration submitted successfully',
      });

      // Show approval pending message
      if (response.data?.status === 'pending') {
        toast({
          variant: 'warning',
          title: 'Pending Approval',
          description: 'Your company registration is pending admin approval. You will be notified once approved.',
        });
      }
    },
  onError: (error) => {
    const errorMessage = error?.response?.data?.message || 'Registration failed';
    const errorDetail = error?.response?.data?.error;
    const errors = error?.response?.data?.errors;

    toast({
      title: 'Registration Failed',
      description: errors 
        ? Object.values(errors).flat().join(', ')
        : errorDetail
          ? `${errorMessage}: ${errorDetail}`
          : errorMessage,
      variant: 'destructive',
    });
  },
  });
};

// Add after useRegisterCompany hook

export const useVerifyOtp = () => {
  const { toast } = useToast();

  return useMutation<
    OtpVerificationResponse,
    AxiosError<ErrorResponse>,
    OtpVerificationRequest
  >({
    mutationFn: (data) => authApi.verifyOtp(data),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Phone number verified successfully!',
      });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'OTP verification failed';
      
      toast({
        title: 'Verification Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useResendOtp = () => {
  const { toast } = useToast();

  return useMutation <
    OtpResendResponse,
    AxiosError<ErrorResponse>,
    OtpResendRequest
  >({
    mutationFn: (data) => authApi.resendOtp(data),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'OTP Resent!',
        description: response.message || 'New OTP sent to your phone number',
      });
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || 'Failed to resend OTP';
      
      toast({
        title: 'Resend Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

