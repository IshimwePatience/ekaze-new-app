import api from '@/lib/api';
import type { 
  EmployerProfileResponse, 
  EmployerProfileUpdateRequest,
  PhotoUploadResponse 
} from '@/types/employerProfile.types';

export const employerProfileApi = {
  getProfile: async (): Promise<EmployerProfileResponse> => {
    const response = await api.get<EmployerProfileResponse>('/employer/profile/details');
    return response.data;
  },

  updateProfile: async (data: EmployerProfileUpdateRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.put('/employer/profile/details', data);
    return response.data;
  },

  uploadPhoto: async (file: File): Promise<PhotoUploadResponse> => {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await api.post<PhotoUploadResponse>('/employer/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getEmploymentHistory: async (page = 1) => {
    const response = await api.get(`/employer/employment-history?page=${page}`);
    return response.data;
  },

  getHiringRequests: async (page = 1) => {
    const response = await api.get(`/employer/hiring-requests?page=${page}`);
    return response.data;
  },

  getIncidents: async (page = 1) => {
    const response = await api.get(`/employer/incidents?page=${page}`);
    return response.data;
  },

  getRatingsGiven: async (page = 1) => {
    const response = await api.get(`/employer/ratings-given?page=${page}`);
    return response.data;
  },
};