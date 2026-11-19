import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employerApi } from '@/api/employerService';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import type {
  EmployerFilters,
  EmploymentDetailsResponse,
  EmploymentFilters,
  UpdateEmploymentPayload,
} from '@/types/employer.types';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

// Query Keys
export const employerKeys = {
  all: ['company-employers'] as const,
  lists: () => [...employerKeys.all, 'list'] as const,
  list: (page: number, filters?: EmployerFilters) =>
    [...employerKeys.lists(), page, filters] as const,
  details: () => [...employerKeys.all, 'detail'] as const,
  detail: (id: number) => [...employerKeys.details(), id] as const,
  employerWorkers: (employerId: number, page: number, filters?: EmploymentFilters) =>
    [...employerKeys.detail(employerId), 'workers', page, filters] as const,
  employmentDetails: () => [...employerKeys.all, 'employment'] as const,
  employmentDetail: (id: number) => [...employerKeys.employmentDetails(), id] as const,
  statistics: () => [...employerKeys.all, 'statistics'] as const,
};

// Get all employers
export const useEmployers = (page: number = 1, filters?: EmployerFilters) => {
  return useQuery({
    queryKey: employerKeys.list(page, filters),
    queryFn: () => employerApi.getEmployers(page, filters),
    staleTime: 30000,
  });
};

// Get employer statistics
export const useEmployerStatistics = () => {
  return useQuery({
    queryKey: employerKeys.statistics(),
    queryFn: () => employerApi.getEmployerStatistics(),
    staleTime: 60000,
  });
};

// Get employer details
export const useEmployerDetails = (id: number | null) => {
  return useQuery({
    queryKey: employerKeys.detail(id!),
    queryFn: () => employerApi.getEmployerDetails(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Get workers under an employer
export const useEmployerWorkers = (
  employerId: number | null,
  page: number = 1,
  filters?: EmploymentFilters
) => {
  return useQuery({
    queryKey: employerKeys.employerWorkers(employerId!, page, filters),
    queryFn: () => employerApi.getEmployerWorkers(employerId!, page, filters),
    enabled: !!employerId,
    staleTime: 30000,
  });
};

// Get employment details
export const useEmploymentDetails = (id: number | null) => {
  return useQuery({
    queryKey: employerKeys.employmentDetail(id!),
    queryFn: () => employerApi.getEmploymentDetails(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Get full admin employer details
export const useEmployerFullDetails = (id: number | null) => {
  return useQuery({
    queryKey: ['employer-full-details', id],
    queryFn: () => employerApi.getEmployerFullDetails(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

// Update employment
export const useUpdateEmployment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmploymentPayload }) =>
      employerApi.updateEmployment(id, data),
    onSuccess: (response, variables) => {
      toast.success(response.message || 'Employment updated successfully');
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: employerKeys.all });
      queryClient.invalidateQueries({ queryKey: ['company-workers'] });
      queryClient.invalidateQueries({ queryKey: ['company-dashboard'] });
      
      // Invalidate specific employment detail
      queryClient.invalidateQueries({ 
        queryKey: employerKeys.employmentDetail(variables.id) 
      });
      
      // Invalidate employer workers if we have employer context
      const employerId = variables.data.status === 'active' 
        ? queryClient.getQueryData<EmploymentDetailsResponse>(
            employerKeys.employmentDetail(variables.id)
          )?.data.employer_id
        : null;
      
      if (employerId) {
        queryClient.invalidateQueries({ 
          queryKey: employerKeys.detail(employerId) 
        });
      }
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update employment';
      toast.error(errorMessage);
    },
  });
};