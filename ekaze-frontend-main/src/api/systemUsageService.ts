import api from '@/lib/api';
import type {
  SystemUsageResponse,
  HourlyTrafficResponse,
  SystemLoadResponse,
  ApiEndpointsResponse,
  SystemUsageFilters,
} from '@/types/system-usage.types';

export const systemUsageApi = {
  /**
   * Get all system usage data
   */
  getSystemUsage: async (filters?: Partial<SystemUsageFilters>): Promise<SystemUsageResponse> => {
    const response = await api.get<SystemUsageResponse>('/supervisor/system-usage', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get hourly traffic data
   */
  getHourlyTraffic: async (filters?: Partial<SystemUsageFilters>): Promise<HourlyTrafficResponse> => {
    const response = await api.get<HourlyTrafficResponse>('/supervisor/system-usage/hourly-traffic', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get system load trends
   */
  getSystemLoad: async (filters?: Partial<SystemUsageFilters>): Promise<SystemLoadResponse> => {
    const response = await api.get<SystemLoadResponse>('/supervisor/system-usage/system-load', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get API endpoint statistics
   */
  getApiEndpoints: async (filters?: Partial<SystemUsageFilters>): Promise<ApiEndpointsResponse> => {
    const response = await api.get<ApiEndpointsResponse>('/supervisor/system-usage/api-endpoints', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Export system usage data
   */
  exportSystemUsage: async (filters?: Partial<SystemUsageFilters>, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<Blob> => {
    const response = await api.get('/supervisor/system-usage/export', {
      params: { ...filters, format },
      responseType: 'blob',
    });
    return response.data;
  },
};