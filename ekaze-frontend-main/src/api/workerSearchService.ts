import api from '@/lib/api';
import type { 
  WorkerSearchFilters, 
  WorkerSearchResponse, 
  WorkerDetailsResponse,
} from '@/types/worker-search.types';

export const workerSearchApi = {
  /**
   * Public worker search (no authentication required)
   */
  searchPublic: async (filters?: Partial<WorkerSearchFilters>): Promise<WorkerSearchResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => params.append(`${key}[]`, item));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const url = `/workers/search/public${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.post<WorkerSearchResponse>(url, filters || {});
    return response.data;
  },

  /**
   * Authenticated worker search (for employers)
   */
  search: async (filters?: Partial<WorkerSearchFilters>): Promise<WorkerSearchResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => params.append(`${key}[]`, item));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const url = `/employer/workers/search${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.post<WorkerSearchResponse>(url, filters || {});
    return response.data;
  },

  /**
   * Get worker details (only for paid employers)
   */
  getWorkerDetails: async (workerId: number): Promise<WorkerDetailsResponse> => {
    const response = await api.get<WorkerDetailsResponse>(`/employer/workers/${workerId}`);
    return response.data;
  },

  /**
   * Generate worker ID card
   */
  generateIdCard: async (workerId: number): Promise<Blob> => {
    const response = await api.get(`/employer/worker/${workerId}/id-card/generate`, {
      responseType: 'blob',
    });
    return response.data;
  },
};