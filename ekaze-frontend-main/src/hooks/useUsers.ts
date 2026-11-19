import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/userService';
import { useToast } from '@/hooks/use-toast';
import type { CreateJurisdictionRequest } from '@/types/user.types';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  SuspendUserRequest,
  ResetPasswordRequest,
  UserActivityLogsParams,
} from '@/types/user.types';
import { ApiErrorResponse } from '@/types/error.types';
import { AxiosError } from 'axios';

interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
  per_page?: number;
}

interface ErrorResponse {
  message?: string;
}

// Query Keys
export const userKeys = {
  all: ['admin-users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (page: number, filters?: UserFilters) => [...userKeys.lists(), page, filters] as const,
  statistics: () => [...userKeys.all, 'statistics'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  activityLogs: (id: number) => [...userKeys.all, 'activity-logs', id] as const,
  byRole: (role: string, filters?: UserFilters) => [...userKeys.all, 'role', role, filters] as const,
  byStatus: (status: string, filters?: UserFilters) => [...userKeys.all, 'status', status, filters] as const,
};

// Get all users
export const useUsers = (page = 1, filters?: UserFilters) => {
  return useQuery({
    queryKey: userKeys.list(page, filters),
    queryFn: () => userApi.getUsers(page, filters),
    staleTime: 30000,
  });
};

export const useConfirmEmployerPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => userApi.confirmEmployerPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast({ title: 'Success', description: 'Payment confirmed. Employer can now login.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to confirm payment.', variant: 'destructive' });
    },
  });
};


// Get user statistics
export const useUserStatistics = () => {
  return useQuery({
    queryKey: userKeys.statistics(),
    queryFn: () => userApi.getStatistics(),
    staleTime: 60000,
  });
};

// Get users by role
export const useUsersByRole = (role: string, filters?: UserFilters) => {
  return useQuery({
    queryKey: userKeys.byRole(role, filters),
    queryFn: () => userApi.getUsersByRole(role, filters),
    enabled: !!role,
    staleTime: 30000,
  });
};

// Get users by status
export const useUsersByStatus = (status: string, filters?: UserFilters) => {
  return useQuery({
    queryKey: userKeys.byStatus(status, filters),
    queryFn: () => userApi.getUsersByStatus(status, filters),
    enabled: !!status,
    staleTime: 30000,
  });
};

// Get single user
export const useUserDetails = (id: number | null) => {
  return useQuery({
    queryKey: userKeys.detail(id!),
    queryFn: () => userApi.getUser(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Get activity logs
export const useUserActivityLogs = (id: number | null, params: UserActivityLogsParams | number = 1) => {
  return useQuery({
    queryKey: [...userKeys.activityLogs(id!), typeof params === 'number' ? params : params],
    queryFn: () => userApi.getActivityLogs(id!, params),
    enabled: !!id,
    staleTime: 10000,
  });
};

// Create user
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userApi.createUser(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });
      toast({
        title: 'Success',
        description: response.message || 'User created successfully',
        variant: 'success'
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create user';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'User creation Failed',
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

// Update user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      userApi.updateUser(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      toast({
        title: 'Success',
        description: response.message || 'User updated successfully',
        variant: 'success'
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update user',
        variant: 'destructive',
      });
    },
  });
};

// Delete user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => userApi.deleteUser(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });
      toast({
        title: 'Success',
        description: response.message || 'User deleted successfully',
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    },
  });
};

// Activate user
export const useActivateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => userApi.activateUser(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });
      toast({
        title: 'Success',
        description: response.message || 'User activated successfully',
        variant: 'success'
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to activate user',
        variant: 'destructive',
      });
    },
  });
};



// Suspend user
export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SuspendUserRequest }) =>
      userApi.suspendUser(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });
      toast({
        title: 'Success',
        description: response.message || 'User suspended successfully',
        variant: 'success'
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to suspend user';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Suspend Failed',
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

// Verify user
export const useVerifyUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => userApi.verifyUser(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });
      toast({
        title: 'Success',
        description: response.message || 'User verified successfully',
        variant: 'success'
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify user';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'verified Failed',
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

// Reset password
export const useResetUserPassword = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResetPasswordRequest }) =>
      userApi.resetPassword(id, data),
    onSuccess: (response) => {
      toast({
        title: 'Success',
        description: response.message || 'Password reset successfully',
        variant: 'success'
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset account';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'reset Failed',
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

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => userApi.verifyOtp(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });
      toast({
        title: 'Success',
        description: response.message || 'OTP verified successfully',
        variant: 'success'
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify OTP';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'OTP Verification Failed',
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

// Reset OTP Block
export const useResetOtpBlock = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => userApi.resetOtpBlock(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.statistics() });
      toast({
        title: 'Success',
        description: response.message || 'OTP block reset successfully',
        variant: 'success'
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset OTP block';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'OTP Block Reset Failed',
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

// ADD at end of file:
export const useOfficerJurisdictions = (officerId: number | null) => {
  return useQuery({
    queryKey: [...userKeys.all, 'jurisdictions', officerId],
    queryFn: () => userApi.getOfficerJurisdictions(officerId!),
    enabled: !!officerId,
    staleTime: 30000,
  });
};

export const useAssignJurisdiction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateJurisdictionRequest) => userApi.assignJurisdiction(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast({ variant: 'success', title: 'Success', description: response.message || 'Jurisdiction assigned' });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to assign jurisdiction', variant: 'destructive' });
    },
  });
};

export const useDeleteJurisdiction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => userApi.deleteJurisdiction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      toast({ variant: 'success', title: 'Success', description: 'Jurisdiction removed' });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to remove jurisdiction', variant: 'destructive' });
    },
  });
};