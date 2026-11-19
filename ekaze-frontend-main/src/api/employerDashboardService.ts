import api from '@/lib/api';
import type { 
  EmployerDashboardResponse, 
  EmployerDashboardFilters,
  ExportOptions 
} from '@/types/employer-dashboard.types';

export const employerDashboardApi = {
  /**
   * Get employer dashboard data with optional filters
   */
  getDashboard: async (filters?: Partial<EmployerDashboardFilters>): Promise<EmployerDashboardResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = `/employer/dashboard${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<EmployerDashboardResponse>(url);
    return response.data;
  },

  /**
   * Export dashboard data with filters
   */
  exportDashboard: async (format: 'json' | 'csv' | 'pdf' = 'json', filters?: Partial<EmployerDashboardFilters>): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/employer/dashboard/export?${params.toString()}`, {
      responseType: 'blob',
    });
    
    return response.data;
  },
};