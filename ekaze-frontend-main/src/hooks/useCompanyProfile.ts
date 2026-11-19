import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { companyProfileApi } from '@/api/companyProfileService';
import type { CompanyProfileUpdateRequest } from '@/types/companyProfile.types';

export const companyProfileKeys = {
  all: ['company-profile'] as const,
  detail: () => [...companyProfileKeys.all, 'detail'] as const,
};

export const useCompanyProfile = () => {
  return useQuery({
    queryKey: companyProfileKeys.detail(),
    queryFn: () => companyProfileApi.getProfile(),
    staleTime: 60_000,
  });
};


export const useUpdateCompanyProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: CompanyProfileUpdateRequest) => companyProfileApi.updateProfile(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: companyProfileKeys.all });
      toast({ variant: 'success', title: 'Success', description: response.message || 'Profile updated' });
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile' });
    },
  });
};