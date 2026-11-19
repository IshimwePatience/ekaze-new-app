import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employerHiringRequestApi } from '@/api/employerHiringRequestService';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { HiringRequestFilters, HiringRequestFormData } from '@/types/employer-hiring-request.types';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export const employerHiringRequestKeys = {
  all: ['employerHiringRequests'] as const,
  lists: () => [...employerHiringRequestKeys.all, 'list'] as const,
  list: (filters?: Partial<HiringRequestFilters>) => [...employerHiringRequestKeys.lists(), filters || {}] as const,
  details: () => [...employerHiringRequestKeys.all, 'detail'] as const,
  detail: (id: number) => [...employerHiringRequestKeys.details(), id] as const,
};

export const useEmployerHiringRequests = (filters?: Partial<HiringRequestFilters>) => {
  return useQuery({
    queryKey: employerHiringRequestKeys.list(filters),
    queryFn: () => employerHiringRequestApi.getRequests(filters),
  });
};

export const useEmployerHiringRequest = (id: number | null) => {
  return useQuery({
    queryKey: employerHiringRequestKeys.detail(id!),
    queryFn: () => employerHiringRequestApi.getRequest(id!),
    enabled: !!id,
  });
};

export const useCreateHiringRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (data: HiringRequestFormData) => employerHiringRequestApi.createRequest(data),
    onSuccess: (data) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: data.message || 'Hiring request created successfully',
      });
      queryClient.invalidateQueries({ queryKey: employerHiringRequestKeys.lists() });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create hiring request';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Creation Failed',
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

export const useCancelHiringRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (id: number) => employerHiringRequestApi.cancelRequest(id),
    onSuccess: (data) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: data.message || 'Hiring request cancelled successfully',
      });
      queryClient.invalidateQueries({ queryKey: employerHiringRequestKeys.lists() });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel hiring request';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Cancellation Failed',
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