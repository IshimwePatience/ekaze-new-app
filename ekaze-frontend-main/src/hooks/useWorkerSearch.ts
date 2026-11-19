import { useQuery, useMutation } from '@tanstack/react-query';
import { workerSearchApi } from '@/api/workerSearchService';
import type { WorkerSearchFilters } from '@/types/worker-search.types';

export const workerSearchKeys = {
  all: ['workerSearch'] as const,
  public: (filters?: Partial<WorkerSearchFilters>) => 
    [...workerSearchKeys.all, 'public', filters || {}] as const,
  authenticated: (filters?: Partial<WorkerSearchFilters>) => 
    [...workerSearchKeys.all, 'authenticated', filters || {}] as const,
  details: (workerId: number) => 
    [...workerSearchKeys.all, 'details', workerId] as const,
  idCard: (workerId: number) => 
    [...workerSearchKeys.all, 'idCard', workerId] as const,
};

/**
 * Hook for public worker search (no authentication)
 */
export const usePublicWorkerSearch = (filters?: Partial<WorkerSearchFilters>) => {
  return useQuery({
    queryKey: workerSearchKeys.public(filters),
    queryFn: () => workerSearchApi.searchPublic(filters),
  });
};

/**
 * Hook for authenticated worker search (for employers)
 */
export const useAuthenticatedWorkerSearch = (filters?: Partial<WorkerSearchFilters>) => {
  return useQuery({
    queryKey: workerSearchKeys.authenticated(filters),
    queryFn: () => workerSearchApi.search(filters),
  });
};

/**
 * Hook to get worker details (only for paid employers)
 */
export const useWorkerDetails = (workerId: number | null) => {
  return useQuery({
    queryKey: workerSearchKeys.details(workerId!),
    queryFn: () => workerSearchApi.getWorkerDetails(workerId!),
    enabled: !!workerId,
  });
};

/**
 * Hook to generate worker ID card
 */
export const useGenerateIdCard = () => {
  return useMutation({
    mutationFn: (workerId: number) => workerSearchApi.generateIdCard(workerId),
  });
};