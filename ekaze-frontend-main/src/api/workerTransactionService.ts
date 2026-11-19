import api from '@/lib/api';
import type {
  WorkerTransactionsResponse,
  WorkerTransactionStatisticsResponse,
  WorkerTransactionDetailsResponse,
  WorkerTransactionFilters,
} from '@/types/worker-transaction.types';

export const workerTransactionApi = {
  getTransactions: async (page: number = 1, filters: WorkerTransactionFilters = {}): Promise<WorkerTransactionsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.search) params.append('search', filters.search);
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    const response = await api.get(`/worker/transactions?${params.toString()}`);
    return response.data;
  },

  getStatistics: async (): Promise<WorkerTransactionStatisticsResponse> => {
    const response = await api.get('/worker/transactions/statistics');
    return response.data;
  },

getTransactionDetails: async (id: number): Promise<WorkerTransactionDetailsResponse> => {
    const response = await api.get(`/worker/transactions/${id}`);
    return response.data;
  },

  exportTransactions: async (
    format: 'json' | 'csv' | 'pdf' = 'pdf',
    filters: WorkerTransactionFilters = {}
  ): Promise<Blob> => {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    const response = await api.get(`/worker/transactions/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};