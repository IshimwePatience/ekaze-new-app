import { useQuery, useMutation } from '@tanstack/react-query';
import { companyTransactionApi } from '@/api/companyTransactionService';
import { useToast } from '@/hooks/use-toast';
import type {
  CompanyTransactionFilters,
} from '@/types/company-transaction.types';

// Query Keys
export const companyTransactionKeys = {
  all: ['company-transactions'] as const,
  lists: () => [...companyTransactionKeys.all, 'list'] as const,
  list: (page: number, filters?: CompanyTransactionFilters) =>
    [...companyTransactionKeys.lists(), page, filters] as const,
  details: () => [...companyTransactionKeys.all, 'detail'] as const,
  detail: (id: number) => [...companyTransactionKeys.details(), id] as const,
  statistics: () => [...companyTransactionKeys.all, 'statistics'] as const,
};

// Get all transactions for company
export const useCompanyTransactions = (page: number = 1, filters?: CompanyTransactionFilters) => {
  return useQuery({
    queryKey: companyTransactionKeys.list(page, filters),
    queryFn: () => companyTransactionApi.getTransactions(page, filters),
    staleTime: 30000,
  });
};

// Get transaction statistics for company
export const useCompanyTransactionStatistics = () => {
  return useQuery({
    queryKey: companyTransactionKeys.statistics(),
    queryFn: () => companyTransactionApi.getTransactionStatistics(),
    staleTime: 60000,
  });
};

// Get transaction details for company
export const useCompanyTransactionDetails = (id: number | null) => {
  return useQuery({
    queryKey: companyTransactionKeys.detail(id!),
    queryFn: () => companyTransactionApi.getTransactionDetails(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Export company transactions
export const useExportCompanyTransactions = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      format,
      filters,
    }: {
      format: 'json' | 'csv' | 'pdf';
      filters?: Pick<CompanyTransactionFilters, 'type' | 'status' | 'start_date' | 'end_date'>;
    }) => companyTransactionApi.exportTransactions(format, filters),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Transactions exported successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to export transactions', variant: 'destructive' });
    },
  });
};