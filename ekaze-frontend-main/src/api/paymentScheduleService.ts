import api from '@/lib/api';
import type {
  PaymentSchedulesResponse,
  MarkPaidRequest,
  RequestExtensionRequest,
  RespondExtensionRequest,
  RaiseDisputeRequest,
  ConfirmPaymentRequest,
} from '@/types/payment-schedule.types';

export const paymentScheduleApi = {
  // ── EMPLOYER ──────────────────────────────────────
  getEmployerSchedules: async (params?: { status?: string; worker_id?: number; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.status)    q.append('status',    params.status);
    if (params?.worker_id) q.append('worker_id', params.worker_id.toString());
    if (params?.page)      q.append('page',      params.page.toString());
    const response = await api.get<PaymentSchedulesResponse>(`/employer/payment-schedules?${q}`);
    return response.data;
  },

  markPaid: async (id: number, data: MarkPaidRequest) => {
    const response = await api.post(`/employer/payment-schedules/${id}/mark-paid`, data);
    return response.data;
  },

  requestExtension: async (id: number, data: RequestExtensionRequest) => {
    const response = await api.post(`/employer/payment-schedules/${id}/request-extension`, data);
    return response.data;
  },

  // ── WORKER ────────────────────────────────────────
  getWorkerSchedules: async (params?: { status?: string; page?: number }) => {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.page)   q.append('page',   params.page.toString());
    const response = await api.get<PaymentSchedulesResponse>(`/worker/payment-schedules?${q}`);
    return response.data;
  },

  confirmPayment: async (id: number, data: ConfirmPaymentRequest) => {
    const response = await api.post(`/worker/payment-schedules/${id}/confirm`, data);
    return response.data;
  },

  respondToExtension: async (extensionId: number, data: RespondExtensionRequest) => {
    const response = await api.post(`/worker/payment-schedules/extensions/${extensionId}/respond`, data);
    return response.data;
  },

  raiseDispute: async (id: number, data: RaiseDisputeRequest) => {
    const response = await api.post(`/worker/payment-schedules/${id}/dispute`, data);
    return response.data;
  },
};