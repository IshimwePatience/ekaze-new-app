import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activeWorkersApi } from '@/api/activeWorkersService';
import { AxiosError } from 'axios';
import { useToast } from '@/components/ui/use-toast';
import type { 
  ActiveWorkersFilters,
  BulkGenerateRequest,
  OtpRequest,
  OtpVerifyRequest,
} from '@/types/active-workers.types';

// Add this interface for API error responses
interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

type ToastFn = ReturnType<typeof useToast>['toast'];

export const activeWorkersKeys = {
  all: ['activeWorkers'] as const,
  list: (filters?: Partial<ActiveWorkersFilters>) => 
    [...activeWorkersKeys.all, 'list', filters || {}] as const,
  verify: (nationalId: string) => 
    [...activeWorkersKeys.all, 'verify', nationalId] as const,
  cards: (workerId: number) =>
    [...activeWorkersKeys.all, 'cards', workerId] as const,
};

/**
 * Hook to get active workers list
 */
export const useActiveWorkers = (filters?: Partial<ActiveWorkersFilters>) => {
  return useQuery({
    queryKey: activeWorkersKeys.list(filters),
    queryFn: () => activeWorkersApi.getActiveWorkers(filters),
  });
};

/**
 * Hook to request OTP for worker verification (using National ID only)
 */
export const useRequestOtp = (toast: ToastFn) => {
  return useMutation({
    mutationFn: (data: OtpRequest) => activeWorkersApi.requestOtp(data),
    onSuccess: (data) => {
      toast({
        variant: 'success',
        title: 'OTP Sent!',
        description: data.message || 'OTP has been sent to the worker\'s phone',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'OTP Request Failed',
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

/**
 * Hook to verify OTP and get full worker details
 */
export const useVerifyOtp = (toast: ToastFn) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: OtpVerifyRequest) => activeWorkersApi.verifyOtp(data),
    onSuccess: (data, variables) => {
      toast({
        variant: 'success',
        title: 'Verification Successful!',
        description: data.message || 'Worker verified successfully',
      });
      // Invalidate verification cache
      queryClient.invalidateQueries({ 
        queryKey: activeWorkersKeys.verify(variables.national_id) 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to verify OTP';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Verification Failed',
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

/**
 * Hook to reject worker verification
 */
export const useRejectWorker = (toast: ToastFn) => {
  return useMutation({
    mutationFn: (data: { national_id: string; rejection_reason: string }) => 
      activeWorkersApi.rejectWorker(data),
    onSuccess: (data) => {
      toast({
        variant: 'success',
        title: 'Worker Rejected',
        description: data.message || 'Worker has been rejected successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reject worker';
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

/**
 * Hook to generate ID card (returns card info with URLs)
 */
export const useGenerateIdCard = (toast: ToastFn) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (workerId: number) => activeWorkersApi.generateIdCard(workerId),
    onSuccess: (data, workerId) => {
      toast({
        variant: 'success',
        title: 'ID Card Generated',
        description: data.message || 'ID card generated successfully',
      });
      queryClient.invalidateQueries({ 
        queryKey: activeWorkersKeys.cards(workerId) 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate ID card';
      const errorDetail = error.response?.data?.error;

      toast({
        title: 'Generation Failed',
        description: errorDetail ? `${errorMessage}: ${errorDetail}` : errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to download ID card as PDF
 */
export const useDownloadIdCardPdf = (toast: ToastFn) => {
  return useMutation({
    mutationFn: async (workerId: number) => {
      const blob = await activeWorkersApi.downloadIdCardPdf(workerId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `worker_id_card_${workerId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return blob;
    },
    onSuccess: () => {
      toast({
        variant: 'success',
        title: 'Download Started',
        description: 'PDF download has started',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download PDF';
      toast({
        title: 'Download Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to download ID card as PNG
 */
export const useDownloadIdCardPng = (toast: ToastFn) => {
  return useMutation({
    mutationFn: async (workerId: number) => {
      const blob = await activeWorkersApi.downloadIdCardPng(workerId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `worker_id_card_${workerId}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return blob;
    },
    onSuccess: () => {
      toast({
        variant: 'success',
        title: 'Download Started',
        description: 'PNG download has started',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download PNG';
      toast({
        title: 'Download Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to get all cards for a worker
 */
export const useWorkerCards = (workerId: number, toast: ToastFn) => {
  return useQuery({
    queryKey: activeWorkersKeys.cards(workerId),
    queryFn: () => activeWorkersApi.getWorkerCards(workerId),
    enabled: !!workerId,
  });
};

/**
 * Hook to download QR code
 */
export const useDownloadQrCode = (toast: ToastFn) => {
  return useMutation({
    mutationFn: async (workerId: number) => {
      const blob = await activeWorkersApi.downloadQrCode(workerId);
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr_code_worker_${workerId}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return blob;
    },
    onSuccess: () => {
      toast({
        variant: 'success',
        title: 'QR Code Downloaded',
        description: 'QR code download has started',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to download QR code';
      toast({
        title: 'Download Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to bulk generate ID cards
 */
export const useBulkGenerateCards = (toast: ToastFn) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: BulkGenerateRequest) => 
      activeWorkersApi.bulkGenerateCards(request),
    onSuccess: (data) => {
      toast({
        variant: 'success',
        title: 'Bulk Generation Complete',
        description: data.message || `Successfully generated ${data.data.success_count} of ${data.data.total} cards`,
      });
      queryClient.invalidateQueries({ 
        queryKey: activeWorkersKeys.all 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to bulk generate cards';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Bulk Generation Failed',
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