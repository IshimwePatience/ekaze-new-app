import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { policeProfileApi } from '@/api/policeProfileService';
import type { 
  PoliceProfileUpdateRequest,
  PasswordChangeRequest,
  PoliceProfileResponse 
} from '@/types/policeProfile.types';
import type { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
}

export const policeProfileKeys = {
  all: ['police-profile'] as const,
  detail: () => [...policeProfileKeys.all, 'detail'] as const,
  incidents: () => [...policeProfileKeys.all, 'incidents'] as const,
};

export const usePoliceProfile = () => {
  return useQuery<PoliceProfileResponse>({
    queryKey: policeProfileKeys.detail(),
    queryFn: () => policeProfileApi.getProfile(),
    staleTime: 60_000, // 1 minute
  });
};

export const useUpdatePoliceProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: PoliceProfileUpdateRequest) => policeProfileApi.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: policeProfileKeys.all });
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

export const useUploadPolicePhoto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => policeProfileApi.uploadPhoto(file),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: policeProfileKeys.detail() });
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

export const useChangePassword = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: PasswordChangeRequest) => policeProfileApi.changePassword(data),
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

export const usePoliceIncidents = (page = 1) => {
  return useQuery({
    queryKey: [...policeProfileKeys.incidents(), page],
    queryFn: () => policeProfileApi.getIncidents(page),
  });
};

export const useVerifyIncident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => policeProfileApi.verifyIncident(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: policeProfileKeys.all });
      queryClient.invalidateQueries({ queryKey: policeProfileKeys.incidents() });
      toast({
        variant: 'success',
        title: 'Success',
        description: response.message || 'Incident verified successfully',
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Failed to verify incident',
      });
    },
  });
};