import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workerIncidentApi } from '@/api/workerIncidentService';
import { useToast } from '@/hooks/use-toast';
import type {
  CreateWorkerIncidentRequest,
  WorkerIncidentFilters,
} from '@/types/worker-incident.types';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export const workerIncidentKeys = {
  all:    ['worker-incidents'] as const,
  list:   (filters?: WorkerIncidentFilters) => ['worker-incidents', 'list', filters] as const,
  detail: (id: number) => ['worker-incidents', 'detail', id] as const,
};

// ─── List ──────────────────────────────────────────────────────────────────────
export const useWorkerIncidents = (filters?: WorkerIncidentFilters) => {
  return useQuery({
    queryKey: workerIncidentKeys.list(filters),
    queryFn:  () => workerIncidentApi.getIncidents(filters),
    staleTime: 30_000,
  });
};

// ─── Detail ────────────────────────────────────────────────────────────────────
export const useWorkerIncident = (id: number | null) => {
  return useQuery({
    queryKey: workerIncidentKeys.detail(id ?? 0),
    queryFn:  () => workerIncidentApi.getIncident(id!),
    enabled:  !!id,
    staleTime: 30_000,
  });
};

// ─── Create ────────────────────────────────────────────────────────────────────
export const useWorkerCreateIncident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateWorkerIncidentRequest) =>
      workerIncidentApi.createIncident(data),

    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: workerIncidentKeys.all });
      toast({
        variant: 'success',
        title: 'Incident Reported',
        description:
          response.message ||
          `Incident ${response.data?.incident_number} submitted successfully.`,
      });
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errData = error.response?.data;
      const message = errData?.errors
        ? Object.values(errData.errors).flat().join(', ')
        : errData?.message ?? 'Failed to report incident. Please try again.';

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
};