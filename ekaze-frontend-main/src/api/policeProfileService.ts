import api from '@/lib/api';
import type { 
  PoliceProfileResponse, 
  PoliceProfileUpdateRequest,
  PasswordChangeRequest,
  PhotoUploadResponse 
} from '@/types/policeProfile.types';

export const policeProfileApi = {
  getProfile: async (): Promise<PoliceProfileResponse> => {
    const response = await api.get<PoliceProfileResponse>('/police/profile/details');
    return response.data;
  },

  updateProfile: async (data: PoliceProfileUpdateRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/police/profile/details', data);
    return response.data;
  },

  uploadPhoto: async (file: File): Promise<PhotoUploadResponse> => {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await api.post<PhotoUploadResponse>('/police/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  changePassword: async (data: PasswordChangeRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/police/profile/change-password', data);
    return response.data;
  },

  getIncidents: async (page = 1) => {
    const response = await api.get(`/police/incidents?page=${page}`);
    return response.data;
  },

  verifyIncident: async (id: number) => {
    const response = await api.post(`/police/incidents/${id}/verify`);
    return response.data;
  },
};