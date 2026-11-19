import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employerWorkerApi } from '@/api/employerWorkerService';
import { useToast } from '@/hooks/use-toast';
import type {
  CreateHiringRequestRequest,
  CreatePaymentRequest,
  BulkCreatePaymentRequest,
  EndEmploymentRequest,
  BulkEndEmploymentRequest,
  ConfirmPaymentRequest,
  RateWorkerRequest,
} from '@/types/employer-worker.types';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// ==================== QUERY KEYS ====================

export const employerWorkerKeys = {
  all: ['employer-workers'] as const,
  hiringRequests: () => [...employerWorkerKeys.all, 'hiring-requests'] as const,
  hiringRequest: (id: number) => [...employerWorkerKeys.hiringRequests(), id] as const,
  hiringRequestsList: (page: number, status?: string) =>
    [...employerWorkerKeys.hiringRequests(), 'list', page, status] as const,
  payments: () => [...employerWorkerKeys.all, 'payments'] as const,
  paymentsList: (page: number) => [...employerWorkerKeys.payments(), 'list', page] as const,
  paymentsByEmployment: (employmentId: number) =>
    [...employerWorkerKeys.payments(), 'employment', employmentId] as const,
};


export const useRateWorker = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workerId, data }: { workerId: number; data: RateWorkerRequest }) =>
      employerWorkerApi.rateWorker(workerId, data),
    onSuccess: (_data, variables) => {
      toast({ title: 'Success', description: 'Worker rated successfully.' });
      queryClient.invalidateQueries({ queryKey: employerWorkerKeys.all });
      queryClient.invalidateQueries({ queryKey: ['worker-ratings'] });
      queryClient.invalidateQueries({ queryKey: ['workerDetails'] });
      queryClient.invalidateQueries({ queryKey: ['activeWorkers'] });
      queryClient.invalidateQueries({ queryKey: ['workerSearch'] });
      if (variables?.workerId) {
        queryClient.refetchQueries({ queryKey: ['worker-ratings', variables.workerId] });
      }
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error?.response?.data?.message || 'Failed to rate worker.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });
};


export const useWorkerRatings = (workerId: number | null, page = 1) => {
  return useQuery({
    queryKey: ['worker-ratings', workerId, page],
    queryFn: () => employerWorkerApi.getWorkerRatings(workerId!, page),
    enabled: !!workerId,
  });
};

// ==================== FREELANCE CONTACT ====================

export const useFreelanceContactStatus = (workerId: number | null) => {
  return useQuery({
    queryKey: ['freelance-contact-status', workerId],
    queryFn: () => employerWorkerApi.freelanceContactStatus(workerId!),
    enabled: !!workerId,
    staleTime: 0, // always fresh — payment state changes
  });
};

export const useFreelanceContactInitiate = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ workerId, data }: { workerId: number; data: { pay_account: string; channel: string } }) =>
      employerWorkerApi.freelanceContactInitiate(workerId, data),
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error?.response?.data?.message || 'Failed to initiate payment.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });
};

export const useFreelanceContactConfirm = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ workerId, data }: { workerId: number; data: { payment_id: number; transaction_ref: string } }) =>
      employerWorkerApi.freelanceContactConfirm(workerId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['freelance-contact-status'] });
      toast({ title: 'Contact unlocked', description: response.message, variant: 'success' });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error?.response?.data?.message || 'Failed to confirm payment.';
      toast({ title: 'Payment failed', description: msg, variant: 'destructive' });
    },
  });
};

// ==================== HIRING REQUESTS ====================

export const useEmployerHiringRequests = (page = 1, status?: string) => {
  return useQuery({
    queryKey: employerWorkerKeys.hiringRequestsList(page, status),
    queryFn: () => employerWorkerApi.getHiringRequests(page, status),
    staleTime: 30000,
  });
};

export const useEmployerHiringRequest = (id: number | null) => {
  return useQuery({
    queryKey: employerWorkerKeys.hiringRequest(id!),
    queryFn: () => employerWorkerApi.getHiringRequest(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

export const useCreateHiringRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateHiringRequestRequest) =>
      employerWorkerApi.createHiringRequest(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: employerWorkerKeys.hiringRequests() });
      toast({
        title: 'Success',
        description: response.message || 'Hiring request sent successfully.',
        variant: 'success',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error?.response?.data?.message || 'Failed to send hiring request.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });
};

export const useCancelHiringRequest = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => employerWorkerApi.cancelHiringRequest(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: employerWorkerKeys.hiringRequests() });
      toast({
        title: 'Success',
        description: response.message || 'Hiring request cancelled successfully.',
        variant: 'success',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error?.response?.data?.message || 'Failed to cancel hiring request.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });
};

// ==================== PAYMENTS ====================

export const useEmployerPayments = (page = 1) => {
  return useQuery({
    queryKey: employerWorkerKeys.paymentsList(page),
    queryFn: () => employerWorkerApi.getPayments(page),
    staleTime: 30000,
  });
};

export const usePaymentsByEmployment = (employmentId: number | null) => {
  return useQuery({
    queryKey: employerWorkerKeys.paymentsByEmployment(employmentId!),
    queryFn: () => employerWorkerApi.getPaymentsByEmployment(employmentId!),
    enabled: !!employmentId,
    staleTime: 30000,
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreatePaymentRequest) => employerWorkerApi.createPayment(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: employerWorkerKeys.payments() });
      toast({
        title: 'Payment Recorded',
        description: response.message || 'Payment recorded successfully.',
        variant: 'success',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error?.response?.data?.message || 'Failed to record payment.';
      toast({ title: 'Payment Failed', description: msg, variant: 'destructive' });
    },
  });
};

export const useBulkCreatePayments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: BulkCreatePaymentRequest) =>
      employerWorkerApi.bulkCreatePayments(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: employerWorkerKeys.payments() });
      toast({
        title: 'Bulk Payment Done',
        description:
          response.message ||
          `${response.data.success_count} of ${response.data.total} payments processed.`,
        variant: 'success',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error?.response?.data?.message || 'Bulk payment failed.';
      toast({ title: 'Bulk Payment Failed', description: msg, variant: 'destructive' });
    },
  });
};

export const useEndEmployment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      employmentId,
      data,
    }: {
      employmentId: number;
      data: EndEmploymentRequest;
    }) => employerWorkerApi.endEmployment(employmentId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: employerWorkerKeys.payments() });
      toast({
        title: 'Employment Ended',
        description: response.message || 'Employment ended successfully.',
        variant: 'success',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error?.response?.data?.message || 'Failed to end employment.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    },
  });
};

export const useBulkEndEmployments = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: BulkEndEmploymentRequest) =>
      employerWorkerApi.bulkEndEmployments(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: employerWorkerKeys.payments() });
      toast({
        title: 'Bulk End Done',
        description:
          response.message ||
          `${response.data.success_count} of ${response.data.total} employments ended.`,
        variant: 'success',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error?.response?.data?.message || 'Bulk end failed.';
      toast({ title: 'Bulk End Failed', description: msg, variant: 'destructive' });
    },
  });
};

export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ConfirmPaymentRequest }) =>
      employerWorkerApi.confirmPayment(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: employerWorkerKeys.hiringRequests() });
      toast({
        title: 'Payment Confirmed',
        description: response.message || 'Hiring request is now active.',
        variant: 'success',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg = error?.response?.data?.message || 'Failed to confirm payment.';
      toast({ title: 'Payment Failed', description: msg, variant: 'destructive' });
    },
  });
};