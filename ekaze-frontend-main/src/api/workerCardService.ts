import api from '@/lib/api';
import type {
  WorkerCardStatusResponse,
  InitiateCardPaymentResponse,
  PollCardPaymentResponse,
  GenerateCardResponse,
} from '@/types/worker-card.types';

export const workerCardApi = {
  getStatus: async (): Promise<WorkerCardStatusResponse> => {
    const response = await api.get('/worker/my-card/status');
    return response.data;
  },

  initiatePayment: async (pay_account: string): Promise<InitiateCardPaymentResponse> => {
    const response = await api.post('/worker/my-card/payment/initiate', { pay_account });
    return response.data;
  },

  pollPayment: async (referenceId: string): Promise<PollCardPaymentResponse> => {
    const response = await api.get(`/worker/my-card/payment/poll/${referenceId}`);
    return response.data;
  },

  generateCard: async (): Promise<GenerateCardResponse> => {
    const response = await api.get('/worker/my-card/generate');
    return response.data;
  },

downloadCard: async (): Promise<void> => {
  const response = await api.get('/worker/my-card/download', {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'my_id_card.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
},
};