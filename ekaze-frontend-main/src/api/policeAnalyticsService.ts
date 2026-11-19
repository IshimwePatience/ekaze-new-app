import api from '@/lib/api';
import type {
  PoliceAnalyticsResponse,
  IncidentsListResponse,
  PoliceStatisticsResponse,
  ExportPoliceAnalyticsResponse,
  PoliceAnalyticsFilters,
} from '@/types/police-analytics.types';

export const policeAnalyticsApi = {
  /**
   * Get police dashboard analytics with optional filters
   */
  getDashboard: async (filters?: Partial<PoliceAnalyticsFilters>): Promise<PoliceAnalyticsResponse> => {
    const response = await api.get<PoliceAnalyticsResponse>('/police/dashboard', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get all incidents with optional filters and pagination
   */
  getIncidents: async (
    filters?: Partial<PoliceAnalyticsFilters>,
    page: number = 1,
    perPage: number = 20
  ): Promise<IncidentsListResponse> => {
    const response = await api.get<IncidentsListResponse>('/police/incidents', {
      params: { ...filters, page, per_page: perPage },
    });
    return response.data;
  },

  /**
   * Get police statistics with optional filters
   */
  getStatistics: async (filters?: Partial<PoliceAnalyticsFilters>): Promise<PoliceStatisticsResponse> => {
    const response = await api.get<PoliceStatisticsResponse>('/police/statistics', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get single incident details
   */
  getIncident: async (id: string | number) => {
    const response = await api.get(`/police/incidents/${id}`);
    return response.data;
  },

  /**
   * Assign incident to officer
   */
  assignIncident: async (id: string | number, officerId: number) => {
    const response = await api.post(`/police/incidents/${id}/assign`, {
      officer_id: officerId,
    });
    return response.data;
  },

  /**
   * Update incident status
   */
  updateStatus: async (
    id: string | number,
    status: string,
    resolutionDetails?: string
  ) => {
    const response = await api.post(`/police/incidents/${id}/update-status`, {
      status,
      resolution_details: resolutionDetails,
    });
    return response.data;
  },

  /**
   * Add notes to incident
   */
  addNotes: async (id: string | number, notes: string) => {
    const response = await api.post(`/police/incidents/${id}/notes`, {
      notes,
    });
    return response.data;
  },

  /**
   * Get worker background check
   */
  getWorkerBackground: async (workerId: string | number) => {
    const response = await api.get(`/police/workers/${workerId}/background`);
    return response.data;
  },

  /**
   * Generate reports with optional filters
   */
  generateReports: async (filters?: Partial<PoliceAnalyticsFilters>) => {
    const response = await api.get('/police/reports', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Export police analytics data with optional filters
   */
  exportAnalytics: async (
    format: 'json' | 'csv' | 'pdf' = 'json',
    filters?: Partial<PoliceAnalyticsFilters>
  ): Promise<Blob> => {
    const response = await api.get('/police/export', {
      params: { format, ...filters },
      responseType: 'blob',
    });
    return response.data;
  },
};