import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supervisorProfileApi } from '@/api/supervisorProfileService';
import type { 
  SupervisorProfileUpdateRequest,
  PasswordChangeRequest,
  SupervisorProfileResponse 
} from '@/types/supervisorProfile.types';
import type { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
}

export const supervisorProfileKeys = {
  all: ['supervisor-profile'] as const,
  detail: () => [...supervisorProfileKeys.all, 'detail'] as const,
};

export const useSupervisorProfile = () => {
  return useQuery<SupervisorProfileResponse>({
    queryKey: supervisorProfileKeys.detail(),
    queryFn: () => supervisorProfileApi.getProfile(),
    staleTime: 60_000, // 1 minute
  });
};

export const useUpdateSupervisorProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: SupervisorProfileUpdateRequest) => supervisorProfileApi.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: supervisorProfileKeys.all });
      toast({
        variant: 'success',
        title: 'Success',
        description: response.message || 'Profile updated successfully',
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
      });
    },
  });
};

export const useUploadSupervisorPhoto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => supervisorProfileApi.uploadPhoto(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: supervisorProfileKeys.detail() });
      toast({
        variant: 'success',
        title: 'Success',
        description: response.message || 'Photo uploaded successfully',
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload photo',
      });
    },
  });
};

export const useChangeSupervisorPassword = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: PasswordChangeRequest) => supervisorProfileApi.changePassword(data),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success',
        description: response.message || 'Password changed successfully',
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to change password',
      });
    },
  });
};