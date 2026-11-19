import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { systemUsageApi } from '@/api/systemUsageService';
import type { SystemUsageFilters } from '@/types/system-usage.types';

export const systemUsageKeys = {
  all: ['systemUsage'] as const,
  usage: (filters?: Partial<SystemUsageFilters>) => [...systemUsageKeys.all, 'usage', filters] as const,
  hourlyTraffic: (filters?: Partial<SystemUsageFilters>) => [...systemUsageKeys.all, 'hourlyTraffic', filters] as const,
  systemLoad: (filters?: Partial<SystemUsageFilters>) => [...systemUsageKeys.all, 'systemLoad', filters] as const,
  apiEndpoints: (filters?: Partial<SystemUsageFilters>) => [...systemUsageKeys.all, 'apiEndpoints', filters] as const,
};

/**
 * Hook to fetch all system usage data
 */
export const useSystemUsage = (filters?: Partial<SystemUsageFilters>) => {
  return useQuery({
    queryKey: systemUsageKeys.usage(filters),
    queryFn: () => systemUsageApi.getSystemUsage(filters),
    staleTime: 60000, // 1 minute
    refetchInterval: 120000, // Refetch every 2 minutes
  });
};

/**
 * Hook to fetch hourly traffic data
 */
export const useHourlyTraffic = (filters?: Partial<SystemUsageFilters>) => {
  return useQuery({
    queryKey: systemUsageKeys.hourlyTraffic(filters),
    queryFn: () => systemUsageApi.getHourlyTraffic(filters),
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to fetch system load data
 */
export const useSystemLoad = (filters?: Partial<SystemUsageFilters>) => {
  return useQuery({
    queryKey: systemUsageKeys.systemLoad(filters),
    queryFn: () => systemUsageApi.getSystemLoad(filters),
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to fetch API endpoints data
 */
export const useApiEndpoints = (filters?: Partial<SystemUsageFilters>) => {
  return useQuery({
    queryKey: systemUsageKeys.apiEndpoints(filters),
    queryFn: () => systemUsageApi.getApiEndpoints(filters),
    staleTime: 60000, // 1 minute
  });
};

export const useExportSystemUsage = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ format, filters }: {
      format: 'json' | 'csv' | 'pdf';
      filters?: Partial<SystemUsageFilters>;
    }) => systemUsageApi.exportSystemUsage(filters, format),
    onSuccess: () => {
      toast({ title: 'Success', description: 'System usage exported successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to export system usage', variant: 'destructive' });
    },
  });
};