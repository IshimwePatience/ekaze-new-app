import { useQuery } from '@tanstack/react-query';
import { employerDashboardApi } from '@/api/employerDashboardService';
import type { EmployerDashboardFilters } from '@/types/employer-dashboard.types';


/**
 * Hook to fetch employer dashboard data with filters
 */
export const useEmployerDashboard = (filters?: Partial<EmployerDashboardFilters>) => {
  return useQuery({
    queryKey: employerDashboardKeys.dashboard(filters),
    queryFn: () => employerDashboardApi.getDashboard(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};


export const employerDashboardKeys = {
  all: ['employerDashboard'] as const,
  dashboard: (filters?: Partial<EmployerDashboardFilters>) => 
    [...employerDashboardKeys.all, 'data', filters || {}] as const,
  export: (format: string, filters?: Partial<EmployerDashboardFilters>) => 
    [...employerDashboardKeys.all, 'export', format, filters || {}] as const,
};

/**
 * Hook to export employer dashboard data
 */
export const useEmployerDashboardExport = (format: 'json' | 'csv' | 'pdf' = 'json', filters?: Partial<EmployerDashboardFilters>) => {
  return useQuery({
    queryKey: employerDashboardKeys.export(format, filters),
    queryFn: () => employerDashboardApi.exportDashboard(format, filters),
    enabled: false, // Only run when manually triggered
  });
};