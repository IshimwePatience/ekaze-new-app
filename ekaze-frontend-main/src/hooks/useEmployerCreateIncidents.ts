import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employerCreateIncidentApi } from '@/api/employerCreateIncidentService';
import { useToast } from '@/hooks/use-toast';
import type { CreateEmployerIncidentRequest } from '@/types/employer-create-incident.types';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

// ─── Query Keys ───────────────────────────────────────────────────────────────
export const employerIncidentCreateKeys = {
  activeWorkers: ['employer', 'active-workers'] as const,
};

// ─── Fetch employer's active workers ──────────────────────────────────────────
export const useEmployerActiveWorkers = () => {
  return useQuery({
    queryKey: employerIncidentCreateKeys.activeWorkers,
    queryFn: () => employerCreateIncidentApi.getActiveWorkers(),
    staleTime: 30_000,
  });
};

// ─── Create incident mutation ──────────────────────────────────────────────────
export const useEmployerCreateIncident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateEmployerIncidentRequest) =>
      employerCreateIncidentApi.createIncident(data),

    onSuccess: (response) => {
      // Invalidate the incidents list so IncidentManagement re-fetches
      queryClient.invalidateQueries({ queryKey: ['employer-incidents'] });

      toast({
        variant: 'success',
        title: 'Incident Reported',
        description:
          response.message ||
          `Incident ${response.data?.incident?.incident_number} created successfully.`,
      });
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors
          ? Object.values(error.response?.data?.errors ?? {})
              .flat()
              .join(', ')
          : 'Failed to create incident. Please try again.';

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    },
  });
};