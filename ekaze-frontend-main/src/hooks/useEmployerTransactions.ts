import { useQuery, useMutation } from '@tanstack/react-query';
import { employerTransactionApi } from '@/api/employerTransactionService';
import type { TransactionFilters } from '@/types/employer-transaction.types';

export const employerTransactionKeys = {
  all: ['employerTransactions'] as const,
  lists: () => [...employerTransactionKeys.all, 'list'] as const,
  list: (filters?: Partial<TransactionFilters>) => [...employerTransactionKeys.lists(), filters || {}] as const,
  statistics: () => [...employerTransactionKeys.all, 'statistics'] as const,
  details: () => [...employerTransactionKeys.all, 'detail'] as const,
  detail: (id: number) => [...employerTransactionKeys.details(), id] as const,
};

export const useEmployerTransactions = (filters?: Partial<TransactionFilters>, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: employerTransactionKeys.list(filters),
    queryFn: () => employerTransactionApi.getTransactions(filters),
    enabled: options?.enabled ?? true,
  });
};

export const useEmployerTransactionStatistics = () => {
  return useQuery({
    queryKey: employerTransactionKeys.statistics(),
    queryFn: () => employerTransactionApi.getStatistics(),
  });
};

export const useEmployerTransaction = (id: number | null) => {
  return useQuery({
    queryKey: employerTransactionKeys.detail(id!),
    queryFn: () => employerTransactionApi.getTransaction(id!),
    enabled: !!id,
  });
};

export const useDownloadReceipt = () => {
  return useMutation({
    mutationFn: (id: number) => employerTransactionApi.downloadReceipt(id),
  });
};

export const usePayWorker = () => {
  return useMutation({
    mutationFn: (payload: {
      worker_id?: number;
      worker_ids?: number[];
      pay_all?: boolean;
      payout_type?: string;
      amount?: number;
      payment_method?: string;
      phone_number?: string;
      otp_code?: string;
      notes?: string;
    }) => employerTransactionApi.payWorker(payload),
  });
};

export const useAutoPaymentSettings = () => {
  return useQuery({
    queryKey: ['employer-auto-payment'],
    queryFn: () => employerTransactionApi.getAutoPaymentSettings(),
  });
};

export const useSaveAutoPaymentSettings = () => {
  return useMutation({
    mutationFn: (settings: any) => employerTransactionApi.saveAutoPaymentSettings(settings),
  });
};

export const useEmployerPaymentAwareness = () => {
  return useQuery({
    queryKey: ['employer-payment-awareness'],
    queryFn: () => employerTransactionApi.getPaymentAwareness(),
    refetchInterval: 30000, // refresh every 30s
  });
};