import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { employerProfileApi } from '@/api/employerProfileService';
import type { 
  EmployerProfileUpdateRequest,
  EmployerProfileResponse 
} from '@/types/employerProfile.types';
import type { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
}

export const employerProfileKeys = {
  all: ['employer-profile'] as const,
  detail: () => [...employerProfileKeys.all, 'detail'] as const,
  employmentHistory: () => [...employerProfileKeys.all, 'employment-history'] as const,
  hiringRequests: () => [...employerProfileKeys.all, 'hiring-requests'] as const,
  incidents: () => [...employerProfileKeys.all, 'incidents'] as const,
  ratings: () => [...employerProfileKeys.all, 'ratings'] as const,
};

export const useEmployerProfile = () => {
  return useQuery<EmployerProfileResponse>({
    queryKey: employerProfileKeys.detail(),
    queryFn: () => employerProfileApi.getProfile(),
    staleTime: 60_000, // 1 minute
  });
};

export const useUpdateEmployerProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: EmployerProfileUpdateRequest) => employerProfileApi.updateProfile(data),
    onSuccess: (response: { success: boolean; message: string }) => {
      queryClient.invalidateQueries({ queryKey: employerProfileKeys.all });
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

export const useUploadProfilePhoto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => employerProfileApi.uploadPhoto(file),
    onSuccess: (response: { success: boolean; message: string; photo_url?: string }) => {
      queryClient.invalidateQueries({ queryKey: employerProfileKeys.detail() });
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

export const useEmploymentHistory = (page = 1) => {
  return useQuery({
    queryKey: [...employerProfileKeys.employmentHistory(), page],
    queryFn: () => employerProfileApi.getEmploymentHistory(page),
  });
};

export const useHiringRequests = (page = 1) => {
  return useQuery({
    queryKey: [...employerProfileKeys.hiringRequests(), page],
    queryFn: () => employerProfileApi.getHiringRequests(page),
  });
};

export const useIncidents = (page = 1) => {
  return useQuery({
    queryKey: [...employerProfileKeys.incidents(), page],
    queryFn: () => employerProfileApi.getIncidents(page),
  });
};

export const useRatingsGiven = (page = 1) => {
  return useQuery({
    queryKey: [...employerProfileKeys.ratings(), page],
    queryFn: () => employerProfileApi.getRatingsGiven(page),
  });
};