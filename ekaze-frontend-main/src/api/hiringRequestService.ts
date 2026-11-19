import api from '@/lib/api';
import type {
  HiringRequestsResponse,
  HiringRequestDetailsResponse,
  HiringRequestStatisticsResponse,
  HiringRequestFilters,
  AcceptHiringRequestPayload,
  RejectHiringRequestPayload,
  HiringRequestActionResponse,
  PaymentRequiredResponse,
  InitiatePaymentResponse,
  ConfirmPaymentResponse,
} from '@/types/hiring-request.types';

export const hiringRequestApi = {
  // Get all hiring requests with filters
  getHiringRequests: async (
    page: number = 1,
    filters?: HiringRequestFilters
  ): Promise<HiringRequestsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());

    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.sort_by) params.append('sort_by', filters.sort_by);
    if (filters?.sort_order) params.append('sort_order', filters.sort_order);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const response = await api.get(`/company/hiring-requests?${params.toString()}`);
    return response.data;
  },

  // Get single hiring request details
// Get single hiring request details (handles 402 Payment Required gracefully)
getHiringRequestDetails: async (
  id: number
): Promise<HiringRequestDetailsResponse | PaymentRequiredResponse> => {
  try {
    const response = await api.get(`/company/hiring-requests/${id}`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 402) {
      return error.response.data as PaymentRequiredResponse;
    }
    throw error;
  }
},

// Initiate payment for a hiring request
initiatePayment: async (id: number): Promise<InitiatePaymentResponse> => {
  const response = await api.post(`/company/hiring-requests/${id}/payment/initiate`);
  return response.data;
},

// Confirm/process payment
confirmPayment: async (id: number, paymentId: number): Promise<ConfirmPaymentResponse> => {
  const response = await api.post(`/company/hiring-requests/${id}/payment/confirm`, {
    payment_id: paymentId,
  });
  return response.data;
},

  // Get hiring request statistics
  getHiringRequestStatistics: async (): Promise<HiringRequestStatisticsResponse> => {
    const response = await api.get('/company/hiring-requests/statistics');
    return response.data;
  },

  // Accept hiring request
  acceptHiringRequest: async (
    id: number,
    data: AcceptHiringRequestPayload
  ): Promise<HiringRequestActionResponse> => {
    const response = await api.post(`/company/hiring-requests/${id}/accept`, data);
    return response.data;
  },

  // Reject hiring request
  rejectHiringRequest: async (
    id: number,
    data: RejectHiringRequestPayload
  ): Promise<HiringRequestActionResponse> => {
    const response = await api.post(`/company/hiring-requests/${id}/reject`, data);
    return response.data;
  },
};