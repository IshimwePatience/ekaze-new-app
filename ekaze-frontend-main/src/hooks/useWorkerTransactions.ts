import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { workerTransactionApi } from '@/api/workerTransactionService';
import type { WorkerTransactionFilters } from '@/types/worker-transaction.types';

export const workerTransactionKeys = {
  all: ['workerTransactions'] as const,
  lists: () => [...workerTransactionKeys.all, 'list'] as const,
  list: (page: number, filters: WorkerTransactionFilters) =>
    [...workerTransactionKeys.lists(), page, filters] as const,
  statistics: () => [...workerTransactionKeys.all, 'statistics'] as const,
  details: () => [...workerTransactionKeys.all, 'details'] as const,
  detail: (id: number) => [...workerTransactionKeys.details(), id] as const,
};

export const useWorkerTransactions = (page: number = 1, filters: WorkerTransactionFilters = {}) => {
  return useQuery({
    queryKey: workerTransactionKeys.list(page, filters),
    queryFn: () => workerTransactionApi.getTransactions(page, filters),
    staleTime: 30000,
  });
};

export const useWorkerTransactionStatistics = () => {
  return useQuery({
    queryKey: workerTransactionKeys.statistics(),
    queryFn: () => workerTransactionApi.getStatistics(),
    staleTime: 60000,
  });
};

export const useWorkerTransactionDetails = (id: number | null) => {
  return useQuery({
    queryKey: workerTransactionKeys.detail(id!),
    queryFn: () => workerTransactionApi.getTransactionDetails(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

export const useExportWorkerTransactions = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ format, filters }: {
      format: 'json' | 'csv' | 'pdf';
      filters?: WorkerTransactionFilters;
    }) => workerTransactionApi.exportTransactions(format, filters),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Transactions exported successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to export transactions', variant: 'destructive' });
    },
  });
};