import api from '@/lib/api';
import type {
  UserAnalyticsResponse,
  GrowthTrendsResponse,
  DailyActiveResponse,
  ExportAnalyticsResponse,
  UserAnalyticsFilters,
} from '@/types/user-analytics.types';

export const userAnalyticsApi = {
  /**
   * Get all user analytics data with optional filters
   */
  getUserAnalytics: async (filters?: Partial<UserAnalyticsFilters>): Promise<UserAnalyticsResponse> => {
    const response = await api.get<UserAnalyticsResponse>('/supervisor/user-analytics', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get user growth trends with optional filters
   */
  getGrowthTrends: async (filters?: Partial<UserAnalyticsFilters>): Promise<GrowthTrendsResponse> => {
    const response = await api.get<GrowthTrendsResponse>('/supervisor/user-analytics/growth-trends', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get daily active users statistics with optional filters
   */
  getDailyActive: async (filters?: Partial<UserAnalyticsFilters>): Promise<DailyActiveResponse> => {
    const response = await api.get<DailyActiveResponse>('/supervisor/user-analytics/daily-active', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Export user analytics data with optional filters
   */
  exportAnalytics: async (
    format: 'json' | 'csv' | 'pdf' = 'json',
    filters?: Partial<UserAnalyticsFilters>
  ): Promise<Blob> => {
    const response = await api.get('/supervisor/user-analytics/export', {
      params: { format, ...filters },
      responseType: 'blob',
    });
    return response.data;
  },
};