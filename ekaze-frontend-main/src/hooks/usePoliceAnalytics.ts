import { useQuery } from '@tanstack/react-query';
import { policeAnalyticsApi } from '@/api/policeAnalyticsService';
import type { PoliceAnalyticsFilters } from '@/types/police-analytics.types';

export const policeAnalyticsKeys = {
  all: ['police-analytics'] as const,
  dashboard: (filters: Partial<PoliceAnalyticsFilters>) => 
    [...policeAnalyticsKeys.all, 'dashboard', filters] as const,
  incidents: (filters: Partial<PoliceAnalyticsFilters>, page: number, perPage: number) => 
    [...policeAnalyticsKeys.all, 'incidents', filters, page, perPage] as const,
  statistics: (filters: Partial<PoliceAnalyticsFilters>) => 
    [...policeAnalyticsKeys.all, 'statistics', filters] as const,
  incident: (id: string | number) => 
    [...policeAnalyticsKeys.all, 'incident', id] as const,
  workerBackground: (workerId: string | number) => 
    [...policeAnalyticsKeys.all, 'worker-background', workerId] as const,
};

/**
 * Hook to fetch police dashboard analytics with filters
 */
export const usePoliceDashboard = (filters: Partial<PoliceAnalyticsFilters> = {}) => {
  return useQuery({
    queryKey: policeAnalyticsKeys.dashboard(filters),
    queryFn: () => policeAnalyticsApi.getDashboard(filters),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch incidents list with filters and pagination
 */
export const usePoliceIncidents = (
  filters: Partial<PoliceAnalyticsFilters> = {},
  page: number = 1,
  perPage: number = 20
) => {
  return useQuery({
    queryKey: policeAnalyticsKeys.incidents(filters, page, perPage),
    queryFn: () => policeAnalyticsApi.getIncidents(filters, page, perPage),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch police statistics with filters
 */
export const usePoliceStatistics = (filters: Partial<PoliceAnalyticsFilters> = {}) => {
  return useQuery({
    queryKey: policeAnalyticsKeys.statistics(filters),
    queryFn: () => policeAnalyticsApi.getStatistics(filters),
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to fetch single incident details
 */
export const useIncidentDetails = (id: string | number) => {
  return useQuery({
    queryKey: policeAnalyticsKeys.incident(id),
    queryFn: () => policeAnalyticsApi.getIncident(id),
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * Hook to fetch worker background check
 */
export const useWorkerBackground = (workerId: string | number) => {
  return useQuery({
    queryKey: policeAnalyticsKeys.workerBackground(workerId),
    queryFn: () => policeAnalyticsApi.getWorkerBackground(workerId),
    enabled: !!workerId,
    staleTime: 600000, // 10 minutes
  });
};