import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { financeAnalyticsApi } from '@/api/financeAnalyticsService';
import type { FinanceAnalyticsFilters } from '@/types/finance-analytics.types';

export const financeAnalyticsKeys = {
  all: ['finance-analytics'] as const,
  analytics: (filters: Partial<FinanceAnalyticsFilters>) => 
    [...financeAnalyticsKeys.all, 'data', filters] as const,
  monthlyTrends: (filters: Partial<FinanceAnalyticsFilters>) => 
    [...financeAnalyticsKeys.all, 'monthly-trends', filters] as const,
  revenueBreakdown: (filters: Partial<FinanceAnalyticsFilters>) => 
    [...financeAnalyticsKeys.all, 'revenue-breakdown', filters] as const,
};

/**
 * Hook to fetch finance analytics data with filters
 */
export const useFinanceAnalytics = (filters: Partial<FinanceAnalyticsFilters> = {}) => {
  return useQuery({
    queryKey: financeAnalyticsKeys.analytics(filters),
    queryFn: () => financeAnalyticsApi.getFinanceAnalytics(filters),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch monthly revenue trends with filters
 */
export const useMonthlyTrends = (filters: Partial<FinanceAnalyticsFilters> = {}) => {
  return useQuery({
    queryKey: financeAnalyticsKeys.monthlyTrends(filters),
    queryFn: () => financeAnalyticsApi.getMonthlyTrends(filters),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch revenue breakdown with filters
 */
export const useRevenueBreakdown = (filters: Partial<FinanceAnalyticsFilters> = {}) => {
  return useQuery({
    queryKey: financeAnalyticsKeys.revenueBreakdown(filters),
    queryFn: () => financeAnalyticsApi.getRevenueBreakdown(filters),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useExportFinanceAnalytics = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ format, filters }: {
      format: 'json' | 'csv' | 'pdf';
      filters?: Partial<FinanceAnalyticsFilters>;
    }) => financeAnalyticsApi.exportFinanceAnalytics(format, filters),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Finance analytics exported successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to export finance analytics', variant: 'destructive' });
    },
  });
};