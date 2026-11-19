import api from '@/lib/api';
import type {
  CompanyFeesResponse,
  CompanyFeeResponse,
  CreateFeeRequest,
  UpdateFeeRequest,
    WalletResponse,
  RequestWithdrawalRequest,
} from '@/types/company-fee.types';

export const companyFeeApi = {
  // Company sees own fees
  getMyFees: async (): Promise<CompanyFeesResponse> => {
    const response = await api.get<CompanyFeesResponse>('/company/fees');
    return response.data;
  },

  createFee: async (data: CreateFeeRequest): Promise<CompanyFeeResponse> => {
    const response = await api.post<CompanyFeeResponse>('/company/fees', data);
    return response.data;
  },

  updateFee: async (id: number, data: UpdateFeeRequest): Promise<CompanyFeeResponse> => {
    const response = await api.put<CompanyFeeResponse>(`/company/fees/${id}`, data);
    return response.data;
  },

  rejectFee: async (feeId: number, reason?: string) => {
  const response = await api.post(`/admin/company-fees/${feeId}/reject`, { rejection_reason: reason });
  return response.data;
},

// ADD to companyFeeApi object:
getWallet: async (): Promise<WalletResponse> => {
  const response = await api.get<WalletResponse>('/company/wallet');
  return response.data;
},

requestWithdrawal: async (data: RequestWithdrawalRequest) => {
  const response = await api.post('/company/wallet/withdraw', data);
  return response.data;
},

updateWalletAccount: async (accountNo: string) => {
  const response = await api.put('/company/wallet/account', { account_no: accountNo });
  return response.data;
},

  
};