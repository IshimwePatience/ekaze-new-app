import api from '@/lib/api';
import type {
  CreateWorkerIncidentRequest,
  CreateWorkerIncidentResponse,
  WorkerIncidentDetailResponse,
  WorkerIncidentFilters,
  WorkerIncidentsListResponse,
} from '@/types/worker-incident.types';

export const workerIncidentApi = {
  /**
   * GET /v1/worker/incidents
   */
  getIncidents: async (
    filters?: WorkerIncidentFilters
  ): Promise<WorkerIncidentsListResponse> => {
    const params: Record<string, string | number> = {};
    if (filters?.status && filters.status !== 'all') params.status = filters.status;
    if (filters?.incident_type && filters.incident_type !== 'all') params.incident_type = filters.incident_type;
    if (filters?.page) params.page = filters.page;
    if (filters?.per_page) params.per_page = filters.per_page;

    const response = await api.get<WorkerIncidentsListResponse>(
      '/worker/incidents',
      { params }
    );
    return response.data;
  },

  /**
   * POST /v1/worker/incidents
   */
  createIncident: async (
    data: CreateWorkerIncidentRequest
  ): Promise<CreateWorkerIncidentResponse> => {
    const { evidence_files, ...fields } = data;

    if (evidence_files && evidence_files.length > 0) {
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      evidence_files.forEach((file) => {
        formData.append('evidence_files[]', file);
      });
      const response = await api.post<CreateWorkerIncidentResponse>(
        '/worker/incidents',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    }

    const response = await api.post<CreateWorkerIncidentResponse>(
      '/worker/incidents',
      fields
    );
    return response.data;
  },

  /**
   * GET /v1/worker/incidents/:id
   */
  getIncident: async (id: number): Promise<WorkerIncidentDetailResponse> => {
    const response = await api.get<WorkerIncidentDetailResponse>(
      `/worker/incidents/${id}`
    );
    return response.data;
  },
};