import { useQuery } from '@tanstack/react-query';
import { usageApi } from '@/api/usageService';
import type { UsageStatisticsData } from '@/types/usage.types';

export const usageKeys = {
  all: ['usage'] as const,
  statistics: () => [...usageKeys.all, 'statistics'] as const,
};

/**
 * Fetches public platform statistics for the landing page.
 * Refreshes every 5 minutes; no auth token needed.
 */
export const useUsageStatistics = () => {
  return useQuery({
    queryKey: usageKeys.statistics(),
    queryFn: () => usageApi.getStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (res): UsageStatisticsData => res.data,
  });
};