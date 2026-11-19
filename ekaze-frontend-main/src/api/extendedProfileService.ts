import api from '@/lib/api';
import type {
  ExtendedProfileResponse,
  UpdateExtendedProfileRequest,
  UpdateExtendedProfileResponse,
} from '@/types/otherProfile.types';

export const extendedProfileApi = {
  getExtendedProfile: async (): Promise<ExtendedProfileResponse> => {
    const res = await api.get('/worker/extended-profile');
    return res.data;
  },

  updateExtendedProfile: async (
    data: UpdateExtendedProfileRequest
  ): Promise<UpdateExtendedProfileResponse> => {
    const res = await api.put('/worker/extended-profile', data);
    return res.data;
  },
};