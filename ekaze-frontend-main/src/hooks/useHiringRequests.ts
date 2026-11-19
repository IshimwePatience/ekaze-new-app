import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hiringRequestApi } from '@/api/hiringRequestService';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type {
  HiringRequestFilters,
  AcceptHiringRequestPayload,
  RejectHiringRequestPayload,
} from '@/types/hiring-request.types';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Query Keys
export const hiringRequestKeys = {
  all: ['hiring-requests'] as const,
  lists: () => [...hiringRequestKeys.all, 'list'] as const,
  list: (page: number, filters?: HiringRequestFilters) =>
    [...hiringRequestKeys.lists(), page, filters] as const,
  details: () => [...hiringRequestKeys.all, 'detail'] as const,
  detail: (id: number) => [...hiringRequestKeys.details(), id] as const,
  statistics: () => [...hiringRequestKeys.all, 'statistics'] as const,
};

// Get all hiring requests
export const useHiringRequests = (page: number = 1, filters?: HiringRequestFilters) => {
  return useQuery({
    queryKey: hiringRequestKeys.list(page, filters),
    queryFn: () => hiringRequestApi.getHiringRequests(page, filters),
    staleTime: 30000, // 30 seconds
  });
};

// Get hiring request details
export const useHiringRequestDetails = (id: number | null) => {
  return useQuery({
    queryKey: hiringRequestKeys.detail(id!),
    queryFn: () => hiringRequestApi.getHiringRequestDetails(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Get hiring request statistics
export const useHiringRequestStatistics = () => {
  return useQuery({
    queryKey: hiringRequestKeys.statistics(),
    queryFn: () => hiringRequestApi.getHiringRequestStatistics(),
    staleTime: 60000, // 1 minute
  });
};

// Accept hiring request
export const useAcceptHiringRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AcceptHiringRequestPayload }) =>
      hiringRequestApi.acceptHiringRequest(id, data),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Hiring request accepted successfully',
      });
      queryClient.invalidateQueries({ queryKey: hiringRequestKeys.all });
      queryClient.invalidateQueries({ queryKey: ['company-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['company-workers'] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to accept hiring request';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Accept Failed',
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

// Reject hiring request
export const useRejectHiringRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectHiringRequestPayload }) =>
      hiringRequestApi.rejectHiringRequest(id, data),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Hiring request rejected successfully',
      });
      queryClient.invalidateQueries({ queryKey: hiringRequestKeys.all });
      queryClient.invalidateQueries({ queryKey: ['company-dashboard'] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to reject hiring request';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Rejection Failed',
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

// Initiate payment for hiring request
export const useInitiatePayment = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => hiringRequestApi.initiatePayment(id),
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Payment Initiation Failed',
        description: error.response?.data?.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
    },
  });
};

// Confirm payment for hiring request
export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, paymentId }: { id: number; paymentId: number }) =>
      hiringRequestApi.confirmPayment(id, paymentId),
    onSuccess: (_, variables) => {
      toast({
        variant: 'success',
        title: 'Payment Successful!',
        description: 'Payment confirmed. Loading hiring request details...',
      });
      // Invalidate the detail query so it refetches with access now granted
      queryClient.invalidateQueries({ queryKey: hiringRequestKeys.detail(variables.id) });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Payment Failed',
        description: error.response?.data?.message || 'Failed to process payment',
        variant: 'destructive',
      });
    },
  });
};