import api from '@/lib/api';
import type {
  SupervisorDashboardResponse,
  SupervisorAnalyticsResponse,
  SupervisorDashboardFilters,
} from '@/types/supervisor.types';

export const supervisorApi = {
  /**
   * Get supervisor dashboard data
   */
  getDashboard: async (filters?: Partial<SupervisorDashboardFilters>): Promise<SupervisorDashboardResponse> => {
    const response = await api.get<SupervisorDashboardResponse>('/supervisor/dashboard', {
      params: filters,
    });
    return response.data;
  },

  exportDashboard: async (format: 'json' | 'csv' | 'pdf', filters?: Partial<SupervisorDashboardFilters>) => {
  const response = await api.get('/supervisor/dashboard/export', {
    params: { format, ...filters },
    responseType: 'blob',
  });
  return response.data;
},

  /**
   * Get analytics data
   */
  getAnalytics: async (): Promise<SupervisorAnalyticsResponse> => {
    const response = await api.get<SupervisorAnalyticsResponse>('/supervisor/analytics');
    return response.data;
  },


  

};