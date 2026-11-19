import api from '@/lib/api';
import type {
  CreateEmployerIncidentRequest,
  CreateEmployerIncidentResponse,
  EmployerActiveWorkersResponse,
} from '@/types/employer-create-incident.types';

export const employerCreateIncidentApi = {
  /**
   * POST /v1/employer/incidents
   * Supports multipart/form-data when proof_files are attached
   */
  createIncident: async (
    data: CreateEmployerIncidentRequest
  ): Promise<CreateEmployerIncidentResponse> => {
    const { proof_files, ...fields } = data;

    // If there are files, use FormData
    if (proof_files && proof_files.length > 0) {
      const formData = new FormData();

      // Append all scalar fields
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      // Append each file
      proof_files.forEach((file) => {
        formData.append('proof_files[]', file);
      });

      const response = await api.post<CreateEmployerIncidentResponse>(
        '/employer/incidents',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    }

    // No files — plain JSON
    const response = await api.post<CreateEmployerIncidentResponse>(
      '/employer/incidents',
      fields
    );
    return response.data;
  },

  /**
   * GET /v1/employer/workers/get-active
   * Returns workers currently employed by this employer
   */
  getActiveWorkers: async (): Promise<EmployerActiveWorkersResponse> => {
    const response = await api.get<EmployerActiveWorkersResponse>(
      '/employer/workers/get-active'
    );
    return response.data;
  },
};