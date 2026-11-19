import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyIncidentApi } from '@/api/companyIncidentService';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type {
  CompanyIncidentFilters,
  CompanyCreateIncidentPayload,
  CompanyUpdateIncidentPayload,
} from '@/types/company-incident.types';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Query Keys (Company specific)
export const companyIncidentKeys = {
  all: ['company-incidents'] as const,
  lists: () => [...companyIncidentKeys.all, 'list'] as const,
  list: (page: number, filters?: CompanyIncidentFilters) =>
    [...companyIncidentKeys.lists(), page, filters] as const,
  details: () => [...companyIncidentKeys.all, 'detail'] as const,
  detail: (id: number) => [...companyIncidentKeys.details(), id] as const,
  statistics: () => [...companyIncidentKeys.all, 'statistics'] as const,
  workerIncidents: (workerId: number) =>
    [...companyIncidentKeys.all, 'worker', workerId] as const,
};

// Get all incidents for company
export const useCompanyIncidents = (page: number = 1, filters?: CompanyIncidentFilters) => {
  return useQuery({
    queryKey: companyIncidentKeys.list(page, filters),
    queryFn: () => companyIncidentApi.getIncidents(page, filters),
    staleTime: 30000,
  });
};

// Get incident statistics for company
export const useCompanyIncidentStatistics = () => {
  return useQuery({
    queryKey: companyIncidentKeys.statistics(),
    queryFn: () => companyIncidentApi.getIncidentStatistics(),
    staleTime: 60000,
  });
};

// Get incident details for company
export const useCompanyIncidentDetails = (id: number | null) => {
  return useQuery({
    queryKey: companyIncidentKeys.detail(id!),
    queryFn: () => companyIncidentApi.getIncidentDetails(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Get worker incidents for company
export const useCompanyWorkerIncidents = (workerId: number | null) => {
  return useQuery({
    queryKey: companyIncidentKeys.workerIncidents(workerId!),
    queryFn: () => companyIncidentApi.getWorkerIncidents(workerId!),
    enabled: !!workerId,
    staleTime: 30000,
  });
};

// Create incident (company)
export const useCompanyCreateIncident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CompanyCreateIncidentPayload) => companyIncidentApi.createIncident(data),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Incident reported successfully',
      });
      queryClient.invalidateQueries({ queryKey: companyIncidentKeys.all });
      queryClient.invalidateQueries({ queryKey: companyIncidentKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: ['company-workers'] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to report incident';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Report Failed',
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

// Update incident (company)
export const useCompanyUpdateIncident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompanyUpdateIncidentPayload }) =>
      companyIncidentApi.updateIncident(id, data),
    onSuccess: (response, variables) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Incident updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: companyIncidentKeys.all });
      queryClient.invalidateQueries({ 
        queryKey: companyIncidentKeys.detail(variables.id) 
      });
      queryClient.invalidateQueries({ queryKey: companyIncidentKeys.statistics() });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update incident';
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

// Delete incident (company)
export const useCompanyDeleteIncident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => companyIncidentApi.deleteIncident(id),
    onSuccess: (response, id) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Incident deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: companyIncidentKeys.all });
      queryClient.invalidateQueries({ queryKey: companyIncidentKeys.statistics() });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete incident';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Deletion Failed',
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