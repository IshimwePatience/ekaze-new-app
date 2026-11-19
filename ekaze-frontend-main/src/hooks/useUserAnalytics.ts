import { useQuery, useMutation } from '@tanstack/react-query';
import { userAnalyticsApi } from '@/api/userAnalyticsService';
import type { UserAnalyticsFilters } from '@/types/user-analytics.types';
import { useToast } from '@/hooks/use-toast';

export const userAnalyticsKeys = {
  all: ['user-analytics'] as const,
  analytics: (filters: Partial<UserAnalyticsFilters>) => 
    [...userAnalyticsKeys.all, 'data', filters] as const,
  growthTrends: (filters: Partial<UserAnalyticsFilters>) => 
    [...userAnalyticsKeys.all, 'growth-trends', filters] as const,
  dailyActive: (filters: Partial<UserAnalyticsFilters>) => 
    [...userAnalyticsKeys.all, 'daily-active', filters] as const,
};

/**
 * Hook to fetch user analytics data with filters
 */
export const useUserAnalytics = (filters: Partial<UserAnalyticsFilters> = {}) => {
  return useQuery({
    queryKey: userAnalyticsKeys.analytics(filters),
    queryFn: () => userAnalyticsApi.getUserAnalytics(filters),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useExportUserAnalytics = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ format, filters }: { 
      format: 'json' | 'csv' | 'pdf'; 
      filters?: Partial<UserAnalyticsFilters> 
    }) => userAnalyticsApi.exportAnalytics(format, filters),
    onSuccess: () => {
      toast({ title: 'Success', description: 'User analytics exported successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to export user analytics', variant: 'destructive' });
    },
  });
};

/**
 * Hook to fetch user growth trends with filters
 */
export const useUserGrowthTrends = (filters: Partial<UserAnalyticsFilters> = {}) => {
  return useQuery({
    queryKey: userAnalyticsKeys.growthTrends(filters),
    queryFn: () => userAnalyticsApi.getGrowthTrends(filters),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch daily active users with filters
 */
export const useDailyActiveUsers = (filters: Partial<UserAnalyticsFilters> = {}) => {
  return useQuery({
    queryKey: userAnalyticsKeys.dailyActive(filters),
    queryFn: () => userAnalyticsApi.getDailyActive(filters),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};