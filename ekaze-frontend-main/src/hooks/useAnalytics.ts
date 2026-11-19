import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analyticsService';

export const analyticsKeys = {
  all: ['admin-analytics'] as const,
  platform: (period: string) => [...analyticsKeys.all, 'platform', period] as const,
};

export const usePlatformAnalytics = (period: '7d' | '30d' | '90d' | '1y' = '30d') => {
  return useQuery({
    queryKey: analyticsKeys.platform(period),
    queryFn: () => analyticsApi.getPlatformAnalytics(period),
    staleTime: 300000, // 5 minutes
  });
};