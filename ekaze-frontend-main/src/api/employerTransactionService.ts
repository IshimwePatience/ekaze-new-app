import api from '@/lib/api';
import type { TransactionFilters, TransactionListResponse, Transaction, TransactionStatisticsResponse } from '@/types/employer-transaction.types';

export const employerTransactionApi = {
  /**
   * Get all transactions for employer
   */
  getTransactions: async (filters?: Partial<TransactionFilters>) => {
    const params = new URLSearchParams();
    
    if (filters?.transaction_type && filters.transaction_type !== 'all') params.append('transaction_type', filters.transaction_type);
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.payment_method && filters.payment_method !== 'all') params.append('payment_method', filters.payment_method);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    if (filters?.min_amount) params.append('min_amount', filters.min_amount.toString());
    if (filters?.max_amount) params.append('max_amount', filters.max_amount.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const response = await api.get<TransactionListResponse>(`/employer/transactions?${params.toString()}`);
    return response.data;
  },

  /**
   * Get transaction statistics
   */
  getStatistics: async () => {
    const response = await api.get<TransactionStatisticsResponse>('/employer/transactions/statistics');
    return response.data;
  },

  /**
   * Get single transaction details
   */
  getTransaction: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Transaction }>(`/employer/transactions/${id}`);
    return response.data;
  },

  /**
   * Download receipt
   */
  downloadReceipt: async (id: number) => {
    const response = await api.get(`/employer/transactions/${id}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Request 6-digit SMS OTP for payment method setup/update or salary payout confirmation
   */
  requestPaymentOtp: async (payload: { phone_number: string; purpose?: string }) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      data?: { masked_phone?: string; expires_in?: string };
    }>('/employer/payment-otp/request', payload);
    return response.data;
  },

  /**
   * Disburse salary payment to worker (single worker or smart batch for all workers)
   */
  payWorker: async (payload: {
    worker_id?: number;
    worker_ids?: number[];
    pay_all?: boolean;
    payout_type?: string;
    amount?: number;
    payment_method?: string;
    phone_number?: string;
    otp_code?: string;
    notes?: string;
  }) => {
    const response = await api.post<{
      success: boolean;
      message: string;
      status?: string;
      payment_status?: string;
      referenceId?: string;
      amount?: number;
      payer_phone?: string;
      worker_name?: string;
      worker_phone?: string;
      workers_count?: number;
      data?: any;
    }>('/employer/pay-worker', payload);
    return response.data;
  },

  /**
   * Poll MTN MoMo salary payment status
   */
  pollSalaryPayment: async (referenceId: string) => {
    const response = await api.get<{
      success: boolean;
      payment_status: 'PENDING' | 'SUCCESSFUL' | 'FAILED';
      status: string;
      reason?: string;
      message?: string;
      data?: any;
    }>(`/employer/pay-worker/poll/${referenceId}`);
    return response.data;
  },

  /**
   * Get auto payment settings
   */
  getAutoPaymentSettings: async () => {
    const response = await api.get<{ success: boolean; data: any }>('/employer/auto-payment');
    return response.data;
  },

  /**
   * Save auto payment settings
   */
  saveAutoPaymentSettings: async (settings: any) => {
    const response = await api.post<{ success: boolean; message: string; data: any }>('/employer/auto-payment', settings);
    return response.data;
  },

  /**
   * Get payment awareness & overdue status for employer
   */
  getPaymentAwareness: async () => {
    const response = await api.get<{ success: boolean; data: any }>('/employer/payment-awareness');
    return response.data;
  },
};