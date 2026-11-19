import api from '@/lib/api';
import type {
  SettingsResponse,
  PaymentSettings,
  ApiSettings,
  UpdateSettingRequest,
  UpdatePaymentSettingsRequest,
  UpdateApiSettingsRequest,
  UserProfile,
  UpdateProfileRequest,
  UpdatePasswordRequest,
  ApiResponse,
  SettingsGroup,
  Setting,
} from '@/types/settings.types';

export const settingsApi = {
  // Get all settings
  getAllSettings: async (category?: string): Promise<ApiResponse<SettingsResponse>> => {
    const queryParams = category ? `?category=${category}` : '';
    const response = await api.get<ApiResponse<SettingsResponse>>(
      `/admin/settings${queryParams}`
    );
    return response.data;
  },

  // Get settings by key (category)
  getSettingsByKey: async (key: string): Promise<ApiResponse<SettingsGroup>> => {
    const response = await api.get<ApiResponse<SettingsGroup>>(
      `/admin/settings/${key}`
    );
    return response.data;
  },

  // Get payment settings
  getPaymentSettings: async (): Promise<ApiResponse<PaymentSettings>> => {
    const response = await api.get<ApiResponse<PaymentSettings>>(
      '/admin/settings/payment'
    );
    return response.data;
  },

  // Update payment settings
  updatePaymentSettings: async (
    data: UpdatePaymentSettingsRequest
  ): Promise<ApiResponse<UpdatePaymentSettingsRequest>> => {
    const response = await api.put<ApiResponse<UpdatePaymentSettingsRequest>>(
      '/admin/settings/payment',
      data
    );
    return response.data;
  },

  // Get API settings
  getApiSettings: async (): Promise<ApiResponse<ApiSettings>> => {
    const response = await api.get<ApiResponse<ApiSettings>>(
      '/admin/settings/api'
    );
    return response.data;
  },

  // Update API settings
  updateApiSettings: async (
    provider: 'momo_api' | 'nida_api' | 'sms_api',
    data: UpdateApiSettingsRequest
  ): Promise<ApiResponse<UpdateApiSettingsRequest>> => {
    const response = await api.put<ApiResponse<UpdateApiSettingsRequest>>(
      `/admin/settings/api/${provider}`,
      data
    );
    return response.data;
  },

  // Update single setting
  updateSetting: async (
    key: string,
    data: UpdateSettingRequest
  ): Promise<ApiResponse<Setting>> => {
    const response = await api.put<ApiResponse<Setting>>(
      `/admin/settings/${key}`,
      data
    );
    return response.data;
  },

  // Toggle setting
  toggleSetting: async (key: string): Promise<ApiResponse<Setting>> => {
    const response = await api.post<ApiResponse<Setting>>(
      `/admin/settings/${key}/toggle`
    );
    return response.data;
  },

  // Profile Management
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await api.get<ApiResponse<UserProfile>>(
      '/admin/profile'
    );
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<ApiResponse<UserProfile>> => {
    const response = await api.put<ApiResponse<UserProfile>>(
      '/admin/profile',
      data
    );
    return response.data;
  },

  updatePassword: async (
    data: UpdatePasswordRequest
  ): Promise<ApiResponse<null>> => {
    const response = await api.put<ApiResponse<null>>(
      '/admin/profile/password',
      data
    );
    return response.data;
  },

  updatePhoto: async (file: File): Promise<ApiResponse<{ photo_url: string }>> => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post<ApiResponse<{ photo_url: string }>>(
      '/admin/profile/photo',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  deletePhoto: async (): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(
      '/admin/profile/photo'
    );
    return response.data;
  },
};