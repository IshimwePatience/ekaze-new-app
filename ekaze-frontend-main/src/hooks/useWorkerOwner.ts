import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workerApi } from '@/api/workerOwnerService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type {
  UpdateAvailabilityPayload,
} from '@/types/worker-owner.types';

// Query Keys
export const workerKeys = {
  all: ['worker'] as const,
  dashboard: () => [...workerKeys.all, 'dashboard'] as const,
  profile: () => [...workerKeys.all, 'profile'] as const,
  employments: () => [...workerKeys.all, 'employments'] as const,
  employmentsList: (page: number, status?: string) =>
    [...workerKeys.employments(), page, status] as const,
  ratings: () => [...workerKeys.all, 'ratings'] as const,
  ratingsList: (page: number) =>
    [...workerKeys.ratings(), page] as const,
};

// Get worker dashboard (strictly scoped per user)
export const useWorkerDashboard = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...workerKeys.dashboard(), user?.id],
    queryFn: () => workerApi.getDashboard(),
    staleTime: 5000,
  });
};

// Get worker profile (strictly scoped per user)
export const useWorkerProfile = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...workerKeys.profile(), user?.id],
    queryFn: () => workerApi.getProfile(),
    staleTime: 5000,
  });
};

// Get employment history (strictly scoped per user)
export const useWorkerEmployments = (page: number = 1, status?: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...workerKeys.employmentsList(page, status), user?.id],
    queryFn: () => workerApi.getEmployments(page, status),
    staleTime: 5000,
  });
};

// Get ratings
export const useWorkerRatings = (page: number = 1) => {
  return useQuery({
    queryKey: workerKeys.ratingsList(page),
    queryFn: () => workerApi.getRatings(page),
    staleTime: 30000,
  });
};

// Update availability status
export const useUpdateWorkerAvailability = () => {
  const queryClient = useQueryClient();
    const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateAvailabilityPayload) =>
      workerApi.updateAvailability(data),
    onSuccess: () => {
        toast({
        title: 'Success',
        description: 'Availability updated successfully',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: workerKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: workerKeys.profile() });
    },
onError: (error: unknown) => {
  let description = 'Failed to update availability';

  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    description = axiosError.response?.data?.message || description;
  } else if (error instanceof Error) {
    description = error.message || description;
  }

  toast({ title: 'Error', description, variant: 'destructive' });
},
  });
};