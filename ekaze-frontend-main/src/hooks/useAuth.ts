import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi, ForgotPasswordRequest } from '@/api/authApi';
import type { LoginRequest } from '@/types/auth.types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { ROUTES } from '@/constants/routes';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

import { useToast } from '@/hooks/use-toast';

// Safe Storage Helper to prevent 'Setting the value of user exceeded the quota' DOMException
export const safeSetAuthStorage = (token: string, user: any) => {
  const stripLargeStrings = (obj: any, depth = 0): any => {
    if (!obj || depth > 4) return obj;
    if (typeof obj === 'string') {
      return obj.length > 2000 && obj.startsWith('data:') ? undefined : obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => stripLargeStrings(item, depth + 1));
    }
    if (typeof obj === 'object') {
      const out: any = {};
      for (const [k, v] of Object.entries(obj)) {
        if (k === 'role_profile') continue; // avoid duplicating worker/employer object in localStorage
        out[k] = stripLargeStrings(v, depth + 1);
      }
      return out;
    }
    return obj;
  };

  const cleanUser = stripLargeStrings(user);
  const userJson = JSON.stringify(cleanUser);

  try {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', userJson);
  } catch (storageErr) {
    console.warn('LocalStorage quota exceeded. Clearing non-essential caches and retrying:', storageErr);
    try {
      const keysToKeep = new Set(['auth_token', 'user']);
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && !keysToKeep.has(k)) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', userJson);
    } catch (secondErr) {
      try {
        sessionStorage.setItem('auth_token', token);
        sessionStorage.setItem('user', userJson);
      } catch (sessErr) {
        console.error('Web storage fallback error:', sessErr);
      }
    }
  }
};

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      // If server requests MFA code from authenticator/sms/email
      if (data.requires_mfa) {
        return;
      }

      const token = data.token || data.data?.token;
      const user = data.user || data.data?.user;

      if (!token || !user) {
        toast({
          title: 'Login Error',
          description: 'Failed to read authentication token.',
          variant: 'destructive',
        });
        return;
      }

      // Reset session flag so popup will show if user hasn't set MFA
      try {
        sessionStorage.removeItem('mfa_post_login_shown_' + user.id);
      } catch (e) {}

      // Store token and user data safely without throwing quota exceeded error
      safeSetAuthStorage(token, user);

      // Invalidate and refetch user query
      queryClient.invalidateQueries({ queryKey: ['user'] });

      // Navigate based on user role or return to auto-opened worker (Coursera style)
      const searchParams = new URLSearchParams(window.location.search);
      const urlWorkerId = searchParams.get('workerId') || searchParams.get('autoOpenWorkerId') || searchParams.get('worker');
      const autoOpenId = urlWorkerId || sessionStorage.getItem('auto_open_worker_id');
      const roleRoutes: Record<string, string> = {
        admin: ROUTES.ADMIN_DASHBOARD,
        employer: ROUTES.EMPLOYER_DASHBOARD,
        worker: ROUTES.WORKER_DASHBOARD,
        police: ROUTES.POLICE_DASHBOARD,
        company: ROUTES.COMPANY_DASHBOARD,
        supervisor: ROUTES.SUPERVISOR_DASHBOARD,
      };

      if (autoOpenId && user.role === 'employer') {
        sessionStorage.removeItem('auto_open_worker_id');
        navigate(`/employer?tab=search&workerId=${autoOpenId}`);
      } else {
        navigate(roleRoutes[user.role] || ROUTES.HOME);
      }
    },
onError: (error: AxiosError<ApiErrorResponse & { otp_required?: boolean; otp_verified?: boolean; payment_required?: boolean; trial_expired?: boolean; cycle?: string; phone?: string; role?: string; amount?: number; transaction_id?: string; account_not_found?: boolean; data?: any }>) => {
  const data = error.response?.data;

  // Handle 402 Payment Required (e.g. Free trial ended or subscription due)
  if (error.response?.status === 402 || data?.payment_required) {
    navigate('/auth/payment', {
      state: {
        amount:         data?.data?.amount         || data?.amount         || 0,
        transaction_id: data?.data?.transaction_id || data?.transaction_id || '',
        phone:          data?.data?.phone          || data?.phone          || '',
        role:           data?.data?.role           || data?.role           || 'company',
        cycle:          data?.data?.cycle          || data?.cycle          || '',
        trial_expired:  data?.trial_expired        || false,
      },
    });
    return;
  }

  if (data?.otp_required) {


    if (data?.otp_verified) {
      navigate('/auth/payment', {
        state: {
          amount:         data.amount         || 0,
          transaction_id: data.transaction_id || '',
          role:           data.role           || 'employer',
        },
      });
    } else {
      navigate('/auth/verify-otp', {
        state: {
          phone:             data.phone          || '',
          resends_remaining: 5,
          role:              data.role           || 'worker',
          amount:            data.amount         || 0,
          transaction_id:    data.transaction_id || '',
        },
      });
    }
    return;
  }

      const errorMessage = data?.message || error.message || 'Invalid email or password';
      toast({
        title: data?.account_not_found ? 'Account Not Found' : 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useGoogleLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: { google_id?: string; google_email?: string; email?: string; name?: string; profile_photo?: string; role?: string }) => authApi.googleLogin(data),
    onSuccess: (data) => {
      if (data.requires_mfa) {
        try {
          sessionStorage.setItem("pending_mfa_challenge", JSON.stringify(data));
        } catch (e) {}
        window.dispatchEvent(new CustomEvent("open-login-dropdown"));
        toast({
          title: "MFA Verification Required",
          description: "Please enter your 6-digit authenticator code to complete login.",
        });
        return;
      }

      const token = data.token || data.data?.token;
      const user = data.user || data.data?.user;

      if (!token || !user) {
        toast({
          title: 'Google Login Error',
          description: 'Failed to extract login session token.',
          variant: 'destructive',
        });
        return;
      }

      try {
        sessionStorage.removeItem('mfa_post_login_shown_' + user.id);
      } catch (e) {}

      // Store token and user data safely
      safeSetAuthStorage(token, user);
      queryClient.invalidateQueries({ queryKey: ['user'] });

      const searchParams = new URLSearchParams(window.location.search);
      const urlWorkerId = searchParams.get('workerId') || searchParams.get('autoOpenWorkerId') || searchParams.get('worker');
      const autoOpenId = urlWorkerId || sessionStorage.getItem('auto_open_worker_id');
      const roleRoutes: Record<string, string> = {
        admin: ROUTES.ADMIN_DASHBOARD,
        employer: ROUTES.EMPLOYER_DASHBOARD,
        worker: ROUTES.WORKER_DASHBOARD,
        police: ROUTES.POLICE_DASHBOARD,
        company: ROUTES.COMPANY_DASHBOARD,
        supervisor: ROUTES.SUPERVISOR_DASHBOARD,
      };

      if (autoOpenId && user.role === 'employer') {
        sessionStorage.removeItem('auto_open_worker_id');
        navigate(`/employer?tab=search&workerId=${autoOpenId}`);
      } else {
        navigate(roleRoutes[user.role] || ROUTES.HOME);
      }
    },
    onError: (error: AxiosError<ApiErrorResponse & { account_not_found?: boolean }>) => {
      const isNotFound = error.response?.data?.account_not_found || error.response?.status === 404;
      if (isNotFound) {
        toast({
          title: "Account Not Registered",
          description: "No account found with this Google email. Opening registration for you...",
        });
        window.dispatchEvent(new CustomEvent("open-register-dropdown"));
        return;
      }
      const message = error.response?.data?.message || 'Account does not exist. Please create a new account to continue.';
      toast({
        title: 'Google Login Failed',
        description: message,
        variant: 'destructive',
      });
    },
  });
};

// Logout hook
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // Clear all storage and queries
      queryClient.clear();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');

      navigate('/?login=true', { state: { openLogin: true }, replace: true });
      window.dispatchEvent(new CustomEvent('open-login-dropdown'));
    },
    onError: () => {
      // Even if API call fails, clear storage and redirect
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user');
      queryClient.clear();
      navigate('/?login=true', { state: { openLogin: true }, replace: true });
      window.dispatchEvent(new CustomEvent('open-login-dropdown'));
    },
  });
};

// Forgot password hook
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: (data) => {
      toast.success(data.message || 'Reset link sent successfully!');
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Failed to send reset link. Please try again.';
      
      toast.error(errorMessage);
    },
  });
};

// Get current user hook
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => authApi.me(),
    enabled: !!(localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')),
    retry: false,
  });
};

// Check if user is authenticated
export const useAuth = () => {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    user = null;
  }

  return {
    isAuthenticated: !!token,
    user,
    token,
  };
};