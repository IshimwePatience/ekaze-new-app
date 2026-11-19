import api from '@/lib/api';
import type {
  FinanceAnalyticsResponse,
  MonthlyTrendsResponse,
  RevenueBreakdownResponse,
  ExportFinanceResponse,
  FinanceAnalyticsFilters,
} from '@/types/finance-analytics.types';

export const financeAnalyticsApi = {
  /**
   * Get all finance analytics data with optional filters
   */
  getFinanceAnalytics: async (filters?: Partial<FinanceAnalyticsFilters>): Promise<FinanceAnalyticsResponse> => {
    const response = await api.get<FinanceAnalyticsResponse>('/supervisor/finance-analytics', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get monthly revenue trends with optional filters
   */
  getMonthlyTrends: async (filters?: Partial<FinanceAnalyticsFilters>): Promise<MonthlyTrendsResponse> => {
    const response = await api.get<MonthlyTrendsResponse>('/supervisor/finance-analytics/monthly-trends', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get revenue breakdown by source with optional filters
   */
  getRevenueBreakdown: async (filters?: Partial<FinanceAnalyticsFilters>): Promise<RevenueBreakdownResponse> => {
    const response = await api.get<RevenueBreakdownResponse>('/supervisor/finance-analytics/revenue-breakdown', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Export finance analytics data with optional filters
   */
  exportFinanceAnalytics: async (
    format: 'json' | 'csv' | 'pdf' = 'json',
    filters?: Partial<FinanceAnalyticsFilters>
  ): Promise<Blob> => {
    const response = await api.get('/supervisor/finance-analytics/export', {
      params: { format, ...filters },
      responseType: 'blob',
    });
    return response.data;
  },
};