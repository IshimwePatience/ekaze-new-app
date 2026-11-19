import api from '@/lib/api';
import type {
  CompanyIncidentsResponse,
  CompanyIncidentDetailsResponse,
  CompanyIncidentStatisticsResponse,
  CompanyWorkerIncidentsResponse,
  CompanyCreateIncidentPayload,
  CompanyUpdateIncidentPayload,
  CompanyIncidentActionResponse,
  CompanyIncidentFilters,
} from '@/types/company-incident.types';

export const companyIncidentApi = {
  // Get all incidents for company
  getIncidents: async (
    page: number = 1,
    filters?: CompanyIncidentFilters
  ): Promise<CompanyIncidentsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    if (filters?.status) params.append('status', filters.status);
    if (filters?.incident_type) params.append('incident_type', filters.incident_type);
    if (filters?.worker_id) params.append('worker_id', filters.worker_id.toString());
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.sort_order) params.append('sort_order', filters.sort_order);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const response = await api.get(`/company/incidents?${params.toString()}`);
    return response.data;
  },

  // Get incident statistics for company
  getIncidentStatistics: async (): Promise<CompanyIncidentStatisticsResponse> => {
    const response = await api.get('/company/incidents/statistics');
    return response.data;
  },

  // Get incident details for company
  getIncidentDetails: async (id: number): Promise<CompanyIncidentDetailsResponse> => {
    const response = await api.get(`/company/incidents/${id}`);
    return response.data;
  },

  // Get worker incidents for company
  getWorkerIncidents: async (workerId: number): Promise<CompanyWorkerIncidentsResponse> => {
    const response = await api.get(`/company/incidents/worker/${workerId}`);
    return response.data;
  },

  // Create incident (company)
  createIncident: async (data: CompanyCreateIncidentPayload): Promise<CompanyIncidentActionResponse> => {
    const response = await api.post('/company/incidents', data);
    return response.data;
  },

  // Update incident (company)
  updateIncident: async (
    id: number,
    data: CompanyUpdateIncidentPayload
  ): Promise<CompanyIncidentActionResponse> => {
    const response = await api.put(`/company/incidents/${id}`, data);
    return response.data;
  },

  // Delete incident (company)
  deleteIncident: async (id: number): Promise<CompanyIncidentActionResponse> => {
    const response = await api.delete(`/company/incidents/${id}`);
    return response.data;
  },
};