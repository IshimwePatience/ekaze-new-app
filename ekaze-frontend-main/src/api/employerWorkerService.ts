import api from '@/lib/api';
import type {
  WorkerPaymentsResponse,
  EmploymentPaymentsResponse,
  CreatePaymentRequest,
  CreatePaymentResponse,
  BulkCreatePaymentRequest,
  BulkCreatePaymentResponse,
  EndEmploymentRequest,
  EndEmploymentResponse,
  BulkEndEmploymentRequest,
BulkEndEmploymentResponse,
  CreateHiringRequestRequest,
  CreateHiringRequestResponse,
  HiringRequestsResponse,
  HiringRequestResponse,
  CancelHiringRequestResponse,
  ConfirmPaymentRequest,
  RateWorkerRequest,
  RateWorkerResponse,
  ConfirmPaymentResponse,
  WorkerRatingsResponse,

} from '@/types/employer-worker.types';

export const employerWorkerApi = {
  // Create hiring request
  createHiringRequest: async (data: CreateHiringRequestRequest): Promise<CreateHiringRequestResponse> => {
    const response = await api.post<CreateHiringRequestResponse>('/employer/hiring-requests', data);
    return response.data;
  },

  getWorkerRatings: async (workerId: number, page = 1): Promise<WorkerRatingsResponse> => {
    const response = await api.get<WorkerRatingsResponse>(`/employer/workers/${workerId}/ratings?page=${page}`);
    return response.data;
  },

  // Get all hiring requests for employer
  getHiringRequests: async (page = 1, status?: string): Promise<HiringRequestsResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    if (status) {
      queryParams.append('status', status);
    }
    const response = await api.get<HiringRequestsResponse>(`/employer/hiring-requests?${queryParams.toString()}`);
    return response.data;
  },

  // Rate a worker
  rateWorker: async (workerId: number, data: RateWorkerRequest): Promise<RateWorkerResponse> => {
    const response = await api.post<RateWorkerResponse>(`/employer/workers/${workerId}/rate`, data);
    return response.data;
  },

  // Get single hiring request
  getHiringRequest: async (id: number): Promise<HiringRequestResponse> => {
    const response = await api.get<HiringRequestResponse>(`/employer/hiring-requests/${id}`);
    return response.data;
  },

  // Cancel hiring request
  cancelHiringRequest: async (id: number): Promise<CancelHiringRequestResponse> => {
    const response = await api.post<CancelHiringRequestResponse>(`/employer/hiring-requests/${id}/cancel`);
    return response.data;
  },

    // ==================== PAYMENTS ====================

  /**
   * Get all payments for this employer
   */
  getPayments: async (page = 1): Promise<WorkerPaymentsResponse> => {
    const response = await api.get<WorkerPaymentsResponse>(`/employer/payments?page=${page}`);
    return response.data;
  },

  /**
   * Get payments for a specific employment + summary + next payment date
   */
  getPaymentsByEmployment: async (employmentId: number): Promise<EmploymentPaymentsResponse> => {
    const response = await api.get<EmploymentPaymentsResponse>(
      `/employer/payments/employment/${employmentId}`
    );
    return response.data;
  },

  // ==================== FREELANCE CONTACT ====================

freelanceContactStatus: async (workerId: number): Promise<{ data: { has_paid: boolean; fee?: number } }> => {
  const response = await api.get(`/employer/freelance-contact/${workerId}/status`);
  return response.data;
},

freelanceContactInitiate: async (
  workerId: number,
  data: { pay_account: string; channel: string }
): Promise<{
  data: {
    already_paid?: boolean;
    payment_id?: number;
    amount?: number;
    currency?: string;
    channel?: string;
    note?: string;
  };
}> => {
  const response = await api.post(`/employer/freelance-contact/${workerId}/initiate`, data);
  return response.data;
},

freelanceContactConfirm: async (
  workerId: number,
  data: { payment_id: number; transaction_ref: string }
): Promise<{ message: string; data: { phone: string | null; email: string | null } }> => {
  const response = await api.post(`/employer/freelance-contact/${workerId}/confirm`, data);
  return response.data;
},

  /**
   * Pay a worker for a period
   */
  createPayment: async (data: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    const response = await api.post<CreatePaymentResponse>('/employer/payments', data);
    return response.data;
  },

  /**
   * Bulk pay multiple workers at once
   */
  bulkCreatePayments: async (data: BulkCreatePaymentRequest): Promise<BulkCreatePaymentResponse> => {
    const response = await api.post<BulkCreatePaymentResponse>('/employer/payments/bulk', data);
    return response.data;
  },

  // ==================== EMPLOYMENT ====================

  /**
   * End a single employment
   */
  endEmployment: async (
    employmentId: number,
    data: EndEmploymentRequest
  ): Promise<EndEmploymentResponse> => {
    const response = await api.post<EndEmploymentResponse>(
      `/employer/payments/employment/${employmentId}/end`,
      data
    );
    return response.data;
  },

  /**
   * End multiple employments at once
   */
  bulkEndEmployments: async (
    data: BulkEndEmploymentRequest
  ): Promise<BulkEndEmploymentResponse> => {
    const response = await api.post<BulkEndEmploymentResponse>(
      '/employer/payments/employment/bulk-end',
      data
    );
    return response.data;
  },

  /**
   * Get single payment detail
   */
  getPayment: async (id: number) => {
    const response = await api.get(`/employer/payments/${id}`);
    return response.data;
  },

  confirmPayment: async (id: number, data: ConfirmPaymentRequest): Promise<ConfirmPaymentResponse> => {
  const response = await api.post<ConfirmPaymentResponse>(
    `/employer/hiring-requests/${id}/payment/confirm`,
    data
  );
  return response.data;
},
};