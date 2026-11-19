import api from '@/lib/api';
import type {
  EmployerWorkerLocationsResponse,
  AdminWorkerLocationsResponse,
  SetWorkerLocationRequest,
} from '@/types/worker-location.types';

export const workerLocationApi = {
  // ── EMPLOYER ──────────────────────────────────────────
  getEmployerWorkerLocations: async (): Promise<EmployerWorkerLocationsResponse> => {
    const response = await api.get<EmployerWorkerLocationsResponse>('/employer/workers/locations');
    return response.data;
  },

  setWorkerLocation: async (workerId: number, data: SetWorkerLocationRequest) => {
    const response = await api.post(`/employer/workers/${workerId}/location`, data);
    return response.data;
  },

  removeWorkerLocation: async (workerId: number) => {
    const response = await api.delete(`/employer/workers/${workerId}/location`);
    return response.data;
  },

  getWorkerLocationHistory: async (workerId: number) => {
    const response = await api.get(`/employer/workers/${workerId}/location/history`);
    return response.data;
  },

  // ── ADMIN ─────────────────────────────────────────────
  getAdminWorkerLocations: async (params?: {
    district?: string;
    sector?: string;
    employer_id?: number;
  }): Promise<AdminWorkerLocationsResponse> => {
    const q = new URLSearchParams();
    if (params?.district)    q.append('district',    params.district);
    if (params?.sector)      q.append('sector',      params.sector);
    if (params?.employer_id) q.append('employer_id', params.employer_id.toString());
    const response = await api.get<AdminWorkerLocationsResponse>(`/admin/workers/locations?${q}`);
    return response.data;
  },
};