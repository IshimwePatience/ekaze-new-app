import api from '@/lib/api';
import type { AnalyticsResponse } from '@/types/analytics.types';

export const analyticsApi = {
  // Get platform analytics
  getPlatformAnalytics: async (
    period: '7d' | '30d' | '90d' | '1y' = '30d'
  ): Promise<AnalyticsResponse> => {
    const response = await api.get<AnalyticsResponse>(
      `/admin/analytics?period=${period}`
    );
    return response.data;
  },
};