import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workerApi } from '@/api/workerService';
import { companyApi } from '@/api/companyService';
import { useToast } from '@/hooks/use-toast';
import type { PublicSearchParams } from '@/api/workerService';
import type { ProtectedWorkerDetailsResponse } from '@/types/worker.types';
import type {
  WorkerUpdateRequest,
  WorkerActionRequest,
} from '@/types/worker.types';
import { AxiosError } from 'axios';

interface WorkerFilters {
  status?: string;
  registration_type?: string;
  company_id?: number;
  nida_verified?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  per_page?: number;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Query Keys
export const workerKeys = {
  all: ['workers'] as const,
  analytics: (id: number) => ['worker-analytics', id] as const,
  lists: () => [...workerKeys.all, 'list'] as const,
  list: (page: number, filters?: WorkerFilters) => [...workerKeys.lists(), page, filters] as const,
  publicSearch: (page: number, params?: PublicSearchParams) => [...workerKeys.all, 'public-search', page, params] as const,
  available: (page: number) => [...workerKeys.all, 'available', page] as const,
  hired: (page: number) => [...workerKeys.all, 'hired', page] as const,
  unavailable: (page: number) => [...workerKeys.all, 'unavailable', page] as const,
  details: () => [...workerKeys.all, 'detail'] as const,
  detail: (id: number) => [...workerKeys.details(), id] as const,
  employmentHistory: (id: number) => [...workerKeys.all, 'employment-history', id] as const,
  byCompany: (companyId: number) => [...workerKeys.all, 'by-company', companyId] as const,

};


export const useWorkersByCompany = (
  companyId: number | undefined | null, 
  page = 1, 
  params?: Omit<WorkerFilters, 'company_id'>
) => {
  return useQuery({
    queryKey: [...workerKeys.byCompany(companyId!), page, params],
    queryFn: () => workerApi.getWorkersByCompany(companyId!, page, params),
    enabled: !!companyId,
    staleTime: 30000, // 30 seconds
  });
};



export const useCompanyWorkerDetails = (id: number | null) => {
  return useQuery({
    queryKey: ['company-worker-details', id],
    queryFn: () => companyApi.getCompanyWorkerDetails(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

export const useWorkerEmploymentHistory = (id: number | null) => {
  return useQuery({
    queryKey: ['worker-employment-history', id],
    queryFn: () => companyApi.getCompanyWorkerEmploymentHistory(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

export const useMarkWorkerAvailable = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => companyApi.markCompanyWorkerAvailable(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['company-workers'] });
      queryClient.invalidateQueries({ queryKey: ['company-worker-details'] });
      toast({
        variant: 'success',
        title: 'Success',
        description: response.message || 'Worker marked as available',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to mark worker as available',
        variant: 'destructive',
      });
    },
  });
};



// Get all workers
export const useWorkers = (page = 1, filters?: WorkerFilters) => {
  return useQuery({
    queryKey: workerKeys.list(page, filters),
    queryFn: () => workerApi.getWorkers(page, filters),
    staleTime: 30000, // 30 seconds
  });
};

export const usePublicWorkerSearch = (page = 1, params?: PublicSearchParams, refreshKey = 0) => {
  return useQuery({
    queryKey: [...workerKeys.publicSearch(page, params), refreshKey],
    queryFn: () => workerApi.searchPublicWorkers(page, params),
    staleTime: 30000,
  });
};

export const useCompanyWorkers = (page: number = 1, params?: Omit<WorkerFilters, 'page'>) => {
  return useQuery({
    queryKey: ['company-workers', page, params],
    queryFn: () => companyApi.getCompanyWorkers(page, params),
    staleTime: 30000,
  });
};

// Get available workers
export const useAvailableWorkers = (page = 1, perPage = 15) => {
  return useQuery({
    queryKey: workerKeys.available(page),
    queryFn: () => workerApi.getAvailableWorkers(page, perPage),
    staleTime: 30000,
  });
};

// Get hired workers
export const useHiredWorkers = (page = 1, perPage = 15) => {
  return useQuery({
    queryKey: workerKeys.hired(page),
    queryFn: () => workerApi.getHiredWorkers(page, perPage),
    staleTime: 30000,
  });
};

// Get unavailable workers
export const useUnavailableWorkers = (page = 1, perPage = 15) => {
  return useQuery({
    queryKey: workerKeys.unavailable(page),
    queryFn: () => workerApi.getUnavailableWorkers(page, perPage),
    staleTime: 30000,
  });
};

// Get worker details
export const useWorkerDetails = (id: number | null) => {
  return useQuery({
    queryKey: workerKeys.detail(id!),
    queryFn: () => workerApi.getWorkerDetails(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Get employment history
export const useEmploymentHistory = (id: number | null) => {
  return useQuery({
    queryKey: workerKeys.employmentHistory(id!),
    queryFn: () => workerApi.getEmploymentHistory(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};


export const useProtectedWorkerDetails = (id: number | null) => {
  return useQuery<ProtectedWorkerDetailsResponse>({
    queryKey: [...workerKeys.all, 'protected-detail', id],
    queryFn: () => workerApi.getProtectedWorkerDetails(id!),
    enabled: false,
    staleTime: 30000,
    retry: false,
  });
};


// Update worker
export const useUpdateWorker = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkerUpdateRequest }) =>
      workerApi.updateWorker(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.all });
      toast({
        variant: 'success',
        title: 'Success',
        description: response.message || 'Worker updated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update worker';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Update Failed',
        description: errors 
          ? Object.values(errors).flat().join(', ')
          : errorDetail
            ? `${errorMessage}: ${errorDetail}`
            : errorMessage,
        variant: 'destructive',
      });
    },
  });
};




// Verify NIDA
export const useVerifyNida = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => workerApi.verifyNida(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.all });
      toast({
        title: 'Success',
        description: response.message || 'Worker NIDA verified successfully',
        variant: 'success'
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to verify NIDA',
        variant: 'destructive',
      });
    },
  });
};

// Suspend worker
export const useSuspendWorker = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkerActionRequest }) =>
      workerApi.suspendWorker(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.all });
      toast({
        variant: 'success',
        title: 'Success',
        description: response.message || 'Worker suspended successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to suspend worker';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Suspend Failed',
        description: errors 
          ? Object.values(errors).flat().join(', ')
          : errorDetail
            ? `${errorMessage}: ${errorDetail}`
            : errorMessage,
        variant: 'destructive',
      });
    },
  });
};

// Reactivate worker
export const useReactivateWorker = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => workerApi.reactivateWorker(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.all });
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Worker reactivated successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reactivated worker';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'reactivated Failed',
        description: errors 
          ? Object.values(errors).flat().join(', ')
          : errorDetail
            ? `${errorMessage}: ${errorDetail}`
            : errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useWorkerAnalytics = (id: number | null) => {
  return useQuery({
    queryKey: workerKeys.analytics(id!),
    queryFn: () => workerApi.getWorkerAnalytics(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Delete worker
export const useDeleteWorker = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => workerApi.deleteWorker(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: workerKeys.all });
      toast({
        variant: 'success',
        title: 'Success',
        description: response.message || 'Worker deleted successfully',
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to deleted worker';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'deleted Failed',
        description: errors 
          ? Object.values(errors).flat().join(', ')
          : errorDetail
            ? `${errorMessage}: ${errorDetail}`
            : errorMessage,
        variant: 'destructive',
      });
    },
  });
};