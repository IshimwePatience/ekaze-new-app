import { useQuery } from '@tanstack/react-query';
import { supervisorApi } from '@/api/supervisorService';
import type { SupervisorDashboardFilters } from '@/types/supervisor.types';

export const supervisorKeys = {
  all: ['supervisor'] as const,
  dashboard: (filters?: Partial<SupervisorDashboardFilters>) => [...supervisorKeys.all, 'dashboard', filters] as const,
  analytics: () => [...supervisorKeys.all, 'analytics'] as const,
};

/**
 * Hook to fetch supervisor dashboard data
 */
export const useSupervisorDashboard = (filters?: Partial<SupervisorDashboardFilters>) => {
  return useQuery({
    queryKey: supervisorKeys.dashboard(filters),
    queryFn: () => supervisorApi.getDashboard(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};

/**
 * Hook to fetch supervisor analytics
 */
export const useSupervisorAnalytics = () => {
  return useQuery({
    queryKey: supervisorKeys.analytics(),
    queryFn: () => supervisorApi.getAnalytics(),
    staleTime: 60000, // 1 minute
  });
};