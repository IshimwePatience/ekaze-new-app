import api from '@/lib/api';
import type {
  CompanyTransactionsResponse,
  CompanyTransactionDetailsResponse,
  CompanyTransactionStatisticsResponse,
  CompanyTransactionFilters,
} from '@/types/company-transaction.types';

export const companyTransactionApi = {
  // Get all transactions for company
  getTransactions: async (
    page: number = 1,
    filters?: CompanyTransactionFilters
  ): Promise<CompanyTransactionsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.sort_order) params.append('sort_order', filters.sort_order);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const response = await api.get(`/company/transactions?${params.toString()}`);
    return response.data;
  },

  // Get transaction statistics for company
  getTransactionStatistics: async (): Promise<CompanyTransactionStatisticsResponse> => {
    const response = await api.get('/company/transactions/statistics');
    return response.data;
  },

  // Get transaction details
  getTransactionDetails: async (id: number): Promise<CompanyTransactionDetailsResponse> => {
    const response = await api.get(`/company/transactions/${id}`);
    return response.data;
  },

  // Export transactions
  exportTransactions: async (
    format: 'json' | 'csv' | 'pdf' = 'pdf',
    filters?: Pick<CompanyTransactionFilters, 'type' | 'status' | 'start_date' | 'end_date'>
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters?.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const response = await api.get(`/company/transactions/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};