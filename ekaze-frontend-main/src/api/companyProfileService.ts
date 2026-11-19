import api from '@/lib/api';
import type { CompanyProfileResponse, CompanyProfileUpdateRequest } from '@/types/companyProfile.types';

export const companyProfileApi = {
  getProfile: async (): Promise<CompanyProfileResponse> => {
    const response = await api.get<CompanyProfileResponse>('/company/profile/details');
    return response.data;
  },

  updateProfile: async (data: CompanyProfileUpdateRequest): Promise<{ success: boolean; message: string }> => {
  const response = await api.put('/company/profile/details', data);
  return response.data;
},
};

