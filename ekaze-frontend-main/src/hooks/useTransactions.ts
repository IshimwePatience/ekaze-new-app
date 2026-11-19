import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionApi } from '@/api/transactionService';
import { useToast } from '@/hooks/use-toast';
import type {
  TransactionFilters,
  MarkForReviewRequest,
  ExportTransactionsRequest,
  BaseErrorResponse,
} from '@/types/transaction.types';
import { AxiosError } from 'axios';

// Query Keys
export const transactionKeys = {
  all: ['admin-transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (page: number, filters?: TransactionFilters) => 
    [...transactionKeys.lists(), page, filters] as const,
  statistics: () => [...transactionKeys.all, 'statistics'] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

// Get all transactions
export const useTransactions = (page = 1, filters?: TransactionFilters) => {
  return useQuery({
    queryKey: transactionKeys.list(page, filters),
    queryFn: () => transactionApi.getTransactions(page, filters),
    staleTime: 30000,
  });
};

// Get transaction statistics
export const useTransactionStatistics = (period?: 'day' | 'week' | 'month' | 'year') => {
  return useQuery({
    queryKey: [...transactionKeys.statistics(), period],
    queryFn: () => transactionApi.getStatistics(period),
    staleTime: 60000,
  });
};

// Get single transaction
export const useTransactionDetails = (transactionId: string | null) => {
  return useQuery({
    queryKey: transactionKeys.detail(transactionId!),
    queryFn: () => transactionApi.getTransaction(transactionId!),
    enabled: !!transactionId,
    staleTime: 30000,
  });
};
// Mark transaction for review
export const useMarkForReview = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ transactionId, data }: { 
      transactionId: string; 
      data: MarkForReviewRequest 
    }) => transactionApi.markForReview(transactionId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ 
        queryKey: transactionKeys.detail(variables.transactionId) 
      });
      toast({
        title: 'Success',
        description: response.message || 'Transaction marked for review',
      });
    },
    onError: (error: AxiosError<BaseErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to mark transaction for review',
        variant: 'destructive',
      });
    },
  });
};

// Refund transaction
export const useRefundTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (transactionId: string) => 
      transactionApi.refundTransaction(transactionId),
    onSuccess: (response, transactionId) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ 
        queryKey: transactionKeys.detail(transactionId) 
      });
      toast({
        title: 'Success',
        description: response.message || 'Transaction refunded successfully',
      });
    },
    onError: (error: AxiosError<BaseErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to refund transaction',
        variant: 'destructive',
      });
    },
  });
};

// Export transactions
export const useExportTransactions = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: ExportTransactionsRequest) => 
      transactionApi.exportTransactions(params),
onSuccess: () => {
  toast({
    title: 'Success',
    description: 'Transactions exported successfully',
    variant: 'success'
  });

    },
    onError: (error: AxiosError<BaseErrorResponse>) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to export transactions',
        variant: 'destructive',
      });
    },
  });
};