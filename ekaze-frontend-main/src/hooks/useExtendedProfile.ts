import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { extendedProfileApi } from '@/api/extendedProfileService';
import { useToast } from '@/hooks/use-toast';
import type { UpdateExtendedProfileRequest } from '@/types/otherProfile.types';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export const extendedProfileKeys = {
  all: ['extended-profile'] as const,
  detail: () => [...extendedProfileKeys.all, 'detail'] as const,
};

export const useExtendedProfile = () => {
  return useQuery({
    queryKey: extendedProfileKeys.detail(),
    queryFn: () => extendedProfileApi.getExtendedProfile(),
    staleTime: 60000,
  });
};

export const useUpdateExtendedProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: UpdateExtendedProfileRequest) =>
      extendedProfileApi.updateExtendedProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: extendedProfileKeys.all });
      toast({
        title: 'Success',
        description: response.message || 'Extended profile updated successfully.',
        variant : 'success',
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const msg =
        error?.response?.data?.message || 'Failed to update extended profile.';
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    },
  });
};