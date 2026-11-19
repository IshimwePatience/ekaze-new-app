import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { employerIncidentApi } from '@/api/employerIncidentService';
import type { IncidentFilters, IncidentFormData } from '@/types/employer-incident.types';

export const employerIncidentKeys = {
  all: ['employerIncidents'] as const,
  lists: () => [...employerIncidentKeys.all, 'list'] as const,
  list: (filters?: Partial<IncidentFilters>) => [...employerIncidentKeys.lists(), filters || {}] as const,
  details: () => [...employerIncidentKeys.all, 'detail'] as const,
  detail: (id: number) => [...employerIncidentKeys.details(), id] as const,
};

export const useEmployerIncidents = (filters?: Partial<IncidentFilters>) => {
  return useQuery({
    queryKey: employerIncidentKeys.list(filters),
    queryFn: () => employerIncidentApi.getIncidents(filters),
  });
};

export const useEmployerIncident = (id: number | null) => {
  return useQuery({
    queryKey: employerIncidentKeys.detail(id!),
    queryFn: () => employerIncidentApi.getIncident(id!),
    enabled: !!id,
  });
};

export const useReportIncident = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: IncidentFormData) => employerIncidentApi.reportIncident(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employerIncidentKeys.lists() });
    },
  });
};

export const useExportEmployerIncidents = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (filters?: { status?: string; severity?: string }) =>
      employerIncidentApi.exportIncidents(filters),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Incidents exported successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to export incidents', variant: 'destructive' });
    },
  });
};