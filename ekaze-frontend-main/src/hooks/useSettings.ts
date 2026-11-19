import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/api/settingsService';
import { useToast } from '@/hooks/use-toast';
import type {
  UpdatePaymentSettingsRequest,
  UpdateApiSettingsRequest,
  UpdateSettingRequest,
  UpdateProfileRequest,
  UpdatePasswordRequest,
} from '@/types/settings.types';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Get all settings
export const useSettings = (category?: string) => {
  return useQuery({
    queryKey: ['settings', category],
    queryFn: () => settingsApi.getAllSettings(category),
  });
};

// Get settings by key
export const useSettingsByKey = (key: string) => {
  return useQuery({
    queryKey: ['settings', key],
    queryFn: () => settingsApi.getSettingsByKey(key),
    enabled: !!key,
  });
};

// Get payment settings
export const usePaymentSettings = () => {
  return useQuery({
    queryKey: ['settings', 'payment'],
    queryFn: () => settingsApi.getPaymentSettings(),
  });
};

// Update payment settings
export const useUpdatePaymentSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdatePaymentSettingsRequest) =>
      settingsApi.updatePaymentSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'payment'] });
      toast({
        title: 'Success',
        description: 'Payment settings updated successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update payment settings',
        variant: 'destructive',
      });
    },
  });
};

// Get API settings
export const useApiSettings = () => {
  return useQuery({
    queryKey: ['settings', 'api'],
    queryFn: () => settingsApi.getApiSettings(),
  });
};

// Update API settings
export const useUpdateApiSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      provider,
      data,
    }: {
      provider: 'momo_api' | 'nida_api' | 'sms_api';
      data: UpdateApiSettingsRequest;
    }) => settingsApi.updateApiSettings(provider, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'api'] });
      toast({
        title: 'Success',
        description: 'API settings updated successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update API settings',
        variant: 'destructive',
      });
    },
  });
};

// Update single setting
export const useUpdateSetting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: UpdateSettingRequest }) =>
      settingsApi.updateSetting(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update setting',
        variant: 'destructive',
      });
    },
  });
};

// Toggle setting
export const useToggleSetting = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (key: string) => settingsApi.toggleSetting(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast({
        title: 'Success',
        description: 'Setting toggled successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle setting',
        variant: 'destructive',
      });
    },
  });
};

// Profile hooks
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => settingsApi.getProfile(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => settingsApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePassword = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdatePasswordRequest) => settingsApi.updatePassword(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update password',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePhoto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (file: File) => settingsApi.updatePhoto(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Success',
        description: 'Profile photo updated successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update photo',
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => settingsApi.deletePhoto(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: 'Success',
        description: 'Profile photo deleted successfully',
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete photo',
        variant: 'destructive',
      });
    },
  });
};