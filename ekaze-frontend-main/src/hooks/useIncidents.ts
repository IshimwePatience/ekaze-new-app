import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentApi } from '@/api/incidentService';
import { useToast } from '@/hooks/use-toast';
import type {
  CreateIncidentRequest,
  UpdateIncidentRequest,
  AssignOfficerRequest,
  UpdateStatusRequest,
  AddNotesRequest,
} from '@/types/incident.types';
import { AxiosError } from 'axios';

interface IncidentFilters {
  status?: string;
  severity?: string;
  incident_type?: string;
  worker_id?: number;
  company_id?: number;
  employer_id?: number;
  assigned_officer_id?: number;
  from_date?: string;
  to_date?: string;
  search?: string;
  per_page?: number;
}

interface ErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}


// Add this to your useIncidents hook file
export const useIncidentsByStatus = (
  status: string,
  params?: {
    severity?: string;
    incident_type?: string;
    search?: string;
    per_page?: number;
  }
) => {
  return useQuery({
    queryKey: ["incidents-by-status", status, params],
    queryFn: () => incidentApi.getIncidentsByStatus(status, params),
    enabled: !!status,
  });
};

// Query Keys
export const incidentKeys = {
  all: ['incidents'] as const,
  lists: () => [...incidentKeys.all, 'list'] as const,
  list: (page: number, filters?: IncidentFilters) => [...incidentKeys.lists(), page, filters] as const,
  statistics: () => [...incidentKeys.all, 'statistics'] as const,
  details: () => [...incidentKeys.all, 'detail'] as const,
  detail: (id: number) => [...incidentKeys.details(), id] as const,
  timeline: (id: number) => [...incidentKeys.all, 'timeline', id] as const,
};

// Get all incidents
export const useIncidents = (page = 1, filters?: IncidentFilters) => {
  return useQuery({
    queryKey: incidentKeys.list(page, filters),
    queryFn: () => incidentApi.getIncidents(page, filters),
    staleTime: 30000,
  });
};

// Get statistics
export const useIncidentStatistics = () => {
  return useQuery({
    queryKey: incidentKeys.statistics(),
    queryFn: () => incidentApi.getStatistics(),
    staleTime: 60000,
  });
};

// Get incident details
export const useIncidentDetails = (id: number | null) => {
  return useQuery({
    queryKey: incidentKeys.detail(id!),
    queryFn: () => incidentApi.getIncident(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Get timeline
export const useIncidentTimeline = (id: number | null) => {
  return useQuery({
    queryKey: incidentKeys.timeline(id!),
    queryFn: () => incidentApi.getTimeline(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Create incident
export const useCreateIncident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CreateIncidentRequest) => incidentApi.createIncident(data),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Incident created successfully',
      });
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create incident';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Creation Failed',
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

// Update incident
export const useUpdateIncident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateIncidentRequest }) =>
      incidentApi.updateIncident(id, data),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Incident updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update incident';
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

// Delete incident
export const useDeleteIncident = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => incidentApi.deleteIncident(id),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Incident deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete incident';
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

// Assign officer
export const useAssignOfficer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AssignOfficerRequest }) =>
      incidentApi.assignOfficer(id, data),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Officer assigned successfully',
      });
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to assign officer';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Assignment Failed',
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

// Update status
export const useUpdateIncidentStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStatusRequest }) =>
      incidentApi.updateStatus(id, data),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Status updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update status';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Status Update Failed',
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

// Add notes
export const useAddIncidentNotes = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AddNotesRequest }) =>
      incidentApi.addNotes(id, data),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Notes added successfully',
      });
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add notes';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Add Notes Failed',
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

// ADD at end of file:
export const useAddProofFiles = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, files }: { id: number; files: File[] }) =>
      incidentApi.addProofFiles(id, files),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'Proof files uploaded successfully',
      });
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload files';
      toast({ title: 'Upload Failed', description: errorMessage, variant: 'destructive' });
    },
  });
};

export const useDeleteProofFile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ incidentId, fileId }: { incidentId: number; fileId: number }) =>
      incidentApi.deleteProofFile(incidentId, fileId),
    onSuccess: (response) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: response.message || 'File deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: incidentKeys.all });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete file';
      toast({ title: 'Delete Failed', description: errorMessage, variant: 'destructive' });
    },
  });
};