import api from '@/lib/api';
import type { MyJurisdictionsResponse } from '@/types/police.types';

export const policeJurisdictionApi = {
  getMyJurisdictions: async (): Promise<MyJurisdictionsResponse> => {
    const response = await api.get<MyJurisdictionsResponse>('/police/my-jurisdictions');
    return response.data;
  },
};