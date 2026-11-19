import api from '@/lib/api';
import type {
  TransactionsResponse,
  TransactionDetailsResponse,
  TransactionAnalyticsResponse,
  MarkForReviewRequest,
  ExportTransactionsRequest,
  TransactionFilters,
  ApiResponse,
  Transaction,
} from '@/types/transaction.types';

export const transactionApi = {
  // Get all transactions with filtering and pagination
  getTransactions: async (
    page = 1,
    params?: TransactionFilters
  ): Promise<ApiResponse<TransactionsResponse>> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<ApiResponse<TransactionsResponse>>(
      `/admin/transactions?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get transaction statistics/analytics
  getStatistics: async (
    period?: 'day' | 'week' | 'month' | 'year'
  ): Promise<ApiResponse<TransactionAnalyticsResponse>> => {
    const queryParams = new URLSearchParams();
    if (period) {
      queryParams.append('period', period);
    }
    
    const response = await api.get<ApiResponse<TransactionAnalyticsResponse>>(
      `/admin/transactions/statistics${period ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  },

  // Get single transaction by ID
  getTransaction: async (
    transactionId: string
  ): Promise<ApiResponse<Transaction>> => {
    const response = await api.get<ApiResponse<Transaction>>(
      `/admin/transactions/${transactionId}`
    );
    return response.data;
  },

  // Mark transaction for review
  markForReview: async (
    transactionId: string,
    data: MarkForReviewRequest
  ): Promise<ApiResponse<Transaction>> => {
    const response = await api.post<ApiResponse<Transaction>>(
      `/admin/transactions/${transactionId}/review`,
      data
    );
    return response.data;
  },

  // Refund transaction
  refundTransaction: async (
    transactionId: string
  ): Promise<ApiResponse<Transaction>> => {
    const response = await api.post<ApiResponse<Transaction>>(
      `/admin/transactions/${transactionId}/refund`
    );
    return response.data;
  },

  // Export transactions
  exportTransactions: async (
    params?: ExportTransactionsRequest
  ): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<Blob>(
      `/admin/transactions/export/data${params ? `?${queryParams.toString()}` : ''}`,
      {
        responseType: 'blob'
      }
    );
    return response.data;
  },

  // Get transactions by status (similar to incidents pattern)
  getTransactionsByStatus: async (
    status: string,
    params?: {
      type?: string;
      payment_method?: string;
      search?: string;
      per_page?: number;
    }
  ): Promise<ApiResponse<TransactionsResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<ApiResponse<TransactionsResponse>>(
      `/admin/transactions/by-status/${status}${params ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  },
};