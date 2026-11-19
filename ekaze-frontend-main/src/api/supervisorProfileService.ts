import api from '@/lib/api';
import type { 
  SupervisorProfileResponse, 
  SupervisorProfileUpdateRequest,
  PasswordChangeRequest,
  PhotoUploadResponse 
} from '@/types/supervisorProfile.types';

export const supervisorProfileApi = {
  getProfile: async (): Promise<SupervisorProfileResponse> => {
    const response = await api.get<SupervisorProfileResponse>('/supervisor/profile/details');
    return response.data;
  },

  updateProfile: async (data: SupervisorProfileUpdateRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/supervisor/profile/details', data);
    return response.data;
  },

  uploadPhoto: async (file: File): Promise<PhotoUploadResponse> => {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await api.post<PhotoUploadResponse>('/supervisor/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  changePassword: async (data: PasswordChangeRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/supervisor/profile/change-password', data);
    return response.data;
  },
};