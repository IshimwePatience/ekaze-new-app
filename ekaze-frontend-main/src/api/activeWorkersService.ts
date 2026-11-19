import api from '@/lib/api';
import type { 
  ActiveWorkersFilters,
  ActiveWorkersResponse,
  OtpRequest,
  OtpVerifyRequest,
  WorkerVerificationResponse,
  IdCardGenerateResponse,
  WorkerCardsResponse,
  BulkGenerateRequest,
  BulkGenerateResponse,
} from '@/types/active-workers.types';

export const activeWorkersApi = {
  /**
   * Get active workers for current employer
   */
  getActiveWorkers: async (filters?: Partial<ActiveWorkersFilters>): Promise<ActiveWorkersResponse> => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = `/employer/workers/get-active${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get<ActiveWorkersResponse>(url);
    return response.data;
  },

  /**
   * Request OTP for worker verification using National ID only
   * POST /api/v1/employer/worker/request-otp
   */
  requestOtp: async (data: OtpRequest): Promise<WorkerVerificationResponse> => {
    const response = await api.post<WorkerVerificationResponse>(
      '/employer/worker/request-otp',
      data
    );
    return response.data;
  },

  /**
   * Verify OTP and get full worker details
   * POST /api/v1/employer/worker/verify-otp
   */
  verifyOtp: async (data: OtpVerifyRequest): Promise<WorkerVerificationResponse> => {
    const response = await api.post<WorkerVerificationResponse>(
      '/employer/worker/verify-otp',
      data
    );
    return response.data;
  },

  /**
   * Reject worker verification
   * POST /api/v1/employer/worker/reject
   */
  rejectWorker: async (data: { national_id: string; rejection_reason: string }): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/employer/worker/reject',
      data
    );
    return response.data;
  },

  // ⭐ ID Card Methods (updated endpoints to /employer/worker-id-cards)

  /**
   * Generate ID card (PNG image)
   */
  generateIdCard: async (workerId: number): Promise<IdCardGenerateResponse> => {
    const response = await api.get<IdCardGenerateResponse>(
      `/employer/worker-id-cards/${workerId}/generate`
    );
    return response.data;
  },

  /**
   * Generate ID card as PDF and download
   */
  downloadIdCardPdf: async (workerId: number): Promise<Blob> => {
    const response = await api.get(
      `/employer/worker-id-cards/${workerId}/pdf`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Download the latest ID card PNG
   */
  downloadIdCardPng: async (workerId: number): Promise<Blob> => {
    const response = await api.get(
      `/employer/worker-id-cards/${workerId}/download`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Get all ID cards for a worker
   */
  getWorkerCards: async (workerId: number): Promise<WorkerCardsResponse> => {
    const response = await api.get<WorkerCardsResponse>(
      `/employer/worker-id-cards/${workerId}/list`
    );
    return response.data;
  },

  /**
   * Download QR code only
   */
  downloadQrCode: async (workerId: number): Promise<Blob> => {
    const response = await api.get(
      `/employer/worker-id-cards/${workerId}/qr-code`,
      { responseType: 'blob' }
    );
    return response.data;
  },

  /**
   * Bulk generate ID cards for multiple workers
   */
  bulkGenerateCards: async (request: BulkGenerateRequest): Promise<BulkGenerateResponse> => {
    const response = await api.post<BulkGenerateResponse>(
      '/employer/worker-id-cards/bulk-generate',
      request
    );
    return response.data;
  },
};