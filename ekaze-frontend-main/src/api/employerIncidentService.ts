import api from '@/lib/api';
import type { IncidentFilters, IncidentListResponse, IncidentFormData, Incident } from '@/types/employer-incident.types';

export const employerIncidentApi = {
  /**
   * Get all incidents for employer
   */
  getIncidents: async (filters?: Partial<IncidentFilters>) => {
    const params = new URLSearchParams();
    
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.severity && filters.severity !== 'all') params.append('severity', filters.severity);
    if (filters?.incident_type && filters.incident_type !== 'all') params.append('incident_type', filters.incident_type);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const response = await api.get<IncidentListResponse>(`/employer/incidents?${params.toString()}`);
    return response.data;
  },

  /**
   * Report a new incident
   */
  reportIncident: async (data: IncidentFormData) => {
    const formData = new FormData();
    
    formData.append('worker_id', data.worker_id.toString());
    formData.append('incident_type', data.incident_type);
    formData.append('description', data.description);
    formData.append('incident_date', data.incident_date);

    if (data.incident_subtype) formData.append('incident_subtype', data.incident_subtype);

    
    if (data.incident_location) {
      formData.append('incident_location', data.incident_location);
    }
    
    if (data.evidence_files && data.evidence_files.length > 0) {
      data.evidence_files.forEach((file, index) => {
        formData.append(`evidence_files[${index}]`, file);
      });
    }

    const response = await api.post<{ success: boolean; message: string; data: Incident }>(
      '/employer/incidents',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Get single incident details
   */
  getIncident: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Incident }>(`/employer/incidents/${id}`);
    return response.data;
  },

  exportIncidents: async (filters?: { status?: string; severity?: string }): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);

    const response = await api.get(`/employer/incidents/export/pdf?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

