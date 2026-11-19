import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentScheduleApi } from '@/api/paymentScheduleService';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type {
  MarkPaidRequest,
  RequestExtensionRequest,
  RespondExtensionRequest,
  RaiseDisputeRequest,
  ConfirmPaymentRequest,
} from '@/types/payment-schedule.types';

interface ApiError { message?: string; error?: string; }

const scheduleKeys = {
  all:     ['payment-schedules'] as const,
  employer: (params?: object) => [...scheduleKeys.all, 'employer', params] as const,
  worker:   (params?: object) => [...scheduleKeys.all, 'worker',   params] as const,
};

// ── EMPLOYER HOOKS ───────────────────────────────────────

export const useEmployerSchedules = (params?: { status?: string; worker_id?: number; page?: number }) => {
  return useQuery({
    queryKey: scheduleKeys.employer(params),
    queryFn:  () => paymentScheduleApi.getEmployerSchedules(params),
    staleTime: 30000,
  });
};

export const useMarkPaid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MarkPaidRequest }) =>
      paymentScheduleApi.markPaid(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast({ variant: 'success', title: 'Payment marked', description: res.message });
    },
    onError: (e: AxiosError<ApiError>) => {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to mark payment', variant: 'destructive' });
    },
  });
};

export const useRequestExtension = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RequestExtensionRequest }) =>
      paymentScheduleApi.requestExtension(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast({ variant: 'success', title: 'Extension requested', description: res.message });
    },
    onError: (e: AxiosError<ApiError>) => {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to request extension', variant: 'destructive' });
    },
  });
};

// ── WORKER HOOKS ─────────────────────────────────────────

export const useWorkerSchedules = (params?: { status?: string; page?: number }) => {
  return useQuery({
    queryKey: scheduleKeys.worker(params),
    queryFn:  () => paymentScheduleApi.getWorkerSchedules(params),
    staleTime: 30000,
  });
};

export const useConfirmSchedulePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ConfirmPaymentRequest }) =>
      paymentScheduleApi.confirmPayment(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast({ variant: 'success', title: 'Payment confirmed', description: res.message });
    },
    onError: (e: AxiosError<ApiError>) => {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to confirm payment', variant: 'destructive' });
    },
  });
};

export const useRespondToExtension = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ extensionId, data }: { extensionId: number; data: RespondExtensionRequest }) =>
      paymentScheduleApi.respondToExtension(extensionId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast({ variant: 'success', title: 'Response sent', description: res.message });
    },
    onError: (e: AxiosError<ApiError>) => {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to respond', variant: 'destructive' });
    },
  });
};

export const useRaiseDispute = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RaiseDisputeRequest }) =>
      paymentScheduleApi.raiseDispute(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      toast({ variant: 'success', title: 'Dispute raised', description: res.message });
    },
    onError: (e: AxiosError<ApiError>) => {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to raise dispute', variant: 'destructive' });
    },
  });
};
