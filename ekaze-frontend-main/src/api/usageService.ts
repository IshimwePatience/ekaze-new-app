import api from '@/lib/api';
import type { UsageStatisticsResponse } from '@/types/usage.types';

export const usageApi = {
  /**
   * Fetch public platform-wide usage statistics.
   * No authentication required.
   * GET /api/v1/usage/statistics
   */
  getStatistics: async (): Promise<UsageStatisticsResponse> => {
    const response = await api.get<UsageStatisticsResponse>('/usage/statistics');
    return response.data;
  },
};