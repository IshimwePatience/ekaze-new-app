import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workerProfileApi } from '@/api/workerProfileService';
import { useToast } from '@/hooks/use-toast';
import type {
  UpdateProfileRequest,
  EmploymentFilters,
  RatingFilters,
  UpdateAvailabilityRequest,
} from '@/types/worker-profile.types';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
}

// Query Keys
export const workerProfileKeys = {
  all: ['worker-profile'] as const,
  dashboard: () => [...workerProfileKeys.all, 'dashboard'] as const,
  profile: () => [...workerProfileKeys.all, 'profile'] as const,
  employments: () => [...workerProfileKeys.all, 'employments'] as const,
  employmentsList: (filters?: EmploymentFilters) => 
    [...workerProfileKeys.employments(), filters] as const,
  ratings: () => [...workerProfileKeys.all, 'ratings'] as const,
  ratingsList: (filters?: RatingFilters) => 
    [...workerProfileKeys.ratings(), filters] as const,
};

// Get worker dashboard
export const useWorkerDashboard = () => {
  return useQuery({
    queryKey: workerProfileKeys.dashboard(),
    queryFn: () => workerProfileApi.getDashboard(),
    staleTime: 30000, // 30 seconds
  });
};

// Get worker profile
export const useWorkerProfile = () => {
  return useQuery({
    queryKey: workerProfileKeys.profile(),
    queryFn: () => workerProfileApi.getProfile(),
    staleTime: 60000, // 1 minute
  });
};

// Get employment history
export const useWorkerEmployments = (filters?: EmploymentFilters) => {
  return useQuery({
    queryKey: workerProfileKeys.employmentsList(filters),
    queryFn: () => workerProfileApi.getEmployments(filters),
    staleTime: 30000,
  });
};

// Get ratings
export const useWorkerRatings = (filters?: RatingFilters) => {
  return useQuery({
    queryKey: workerProfileKeys.ratingsList(filters),
    queryFn: () => workerProfileApi.getRatings(filters),
    staleTime: 30000,
  });
};

// Update profile
export const useUpdateWorkerProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => 
      workerProfileApi.updateProfile(data),
    onSuccess: (response) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: workerProfileKeys.all });
      
      toast({
        title: 'Success',
        description: response.message || 'Profile updated successfully',
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });
};

// Update availability
export const useUpdateWorkerAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateAvailabilityRequest) => 
      workerProfileApi.updateAvailability(data),
    onSuccess: (response) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: workerProfileKeys.all });
      
      toast({
        title: 'Success',
        description: response.message || 'Availability updated successfully',
        variant: 'success',
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update availability',
        variant: 'destructive',
      });
    },
  });
};