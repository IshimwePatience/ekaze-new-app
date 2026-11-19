import { useQuery, useMutation, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { companyApi } from '@/api/companyService';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { CompanyActionRequest,CompanyActionResponse, CompanyListItem } from '@/types/company.types';

interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

// Hook to fetch all companies
export const useCompanies = (page = 1) => {
  return useQuery({
    queryKey: ['companies', page],
    queryFn: () => companyApi.getCompanies(page),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch company dashboard
export const useCompanyDashboard = () => {
  return useQuery({
    queryKey: ['company-dashboard'],
    queryFn: () => companyApi.getDashboard(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to fetch company analytics
export const useCompanyAnalytics = (period: number = 30) => {
  return useQuery({
    queryKey: ['company-analytics', period],
    queryFn: () => companyApi.getAnalytics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch pending companies
export const usePendingCompanies = () => {
  return useQuery({
    queryKey: ['companies', 'pending'],
    queryFn: () => companyApi.getPendingCompanies(),
    staleTime: 2 * 60 * 1000,
  });
};

// Hook to fetch approved companies
export const useApprovedCompanies = () => {
  return useQuery({
    queryKey: ['companies', 'approved'],
    queryFn: () => companyApi.getApprovedCompanies(),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch suspended companies
export const useSuspendedCompanies = () => {
  return useQuery({
    queryKey: ['companies', 'suspended'],
    queryFn: () => companyApi.getSuspendedCompanies(),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to fetch company details
export const useCompanyDetails = (id: number | null) => {
  return useQuery({
    queryKey: ['company', id],
    queryFn: () => companyApi.getCompanyDetails(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to approve company
export const useApproveCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => companyApi.approveCompany(id),
    onSuccess: (data) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: data.message || 'Company approved successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to approve company';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Approval Failed',
        description: errors 
          ? Object.values(errors).flat().join(', ')
          : errorDetail
            ? `${errorMessage}: ${errorDetail}`
            : errorMessage,
        variant: 'destructive',
      });
    },
  });
};

// Hook to reject company
export const useRejectCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompanyActionRequest }) =>
      companyApi.rejectCompany(id, data),
    onSuccess: (data) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: data.message || 'Company rejected successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reject company';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Rejection Failed',
        description: errors 
          ? Object.values(errors).flat().join(', ')
          : errorDetail
            ? `${errorMessage}: ${errorDetail}`
            : errorMessage,
        variant: 'destructive',
      });
    },
  });
};




export const useCompanyList = (): UseQueryResult<CompanyListItem[]> => {
  const { toast } = useToast();
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const response = await companyApi.getCompaniesList();
        return response; // This is now already the array from the service
      } catch (error) {
                const axiosError = error as AxiosError<ApiErrorResponse>;
        const errorMessage = axiosError.response?.data?.message || 
                            axiosError.message || 
                            'Failed to load companies';
        const errorDetail = axiosError.response?.data?.error;
        const errors = axiosError.response?.data?.errors;
        
      toast({
        title: 'Load companies failed',
        description: errors 
          ? Object.values(errors).flat().join(', ')
          : errorDetail
            ? `${errorMessage}: ${errorDetail}`
            : errorMessage,
        variant: 'destructive',
      });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to suspend company
export const useSuspendCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompanyActionRequest }) =>
      companyApi.suspendCompany(id, data),
    onSuccess: (data) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: data.message || 'Company suspended successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to suspend company';
      const errorDetail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: 'Suspension Failed',
        description: errors 
          ? Object.values(errors).flat().join(', ')
          : errorDetail
            ? `${errorMessage}: ${errorDetail}`
            : errorMessage,
        variant: 'destructive',
      });
    },
  });
};

// ADD at end of file:
export const useCompanyFeesByCompany = (companyId: number | null) => {
  return useQuery({
    queryKey: ['company-fees', companyId],
    queryFn: () => companyApi.getCompanyFees(companyId!),
    enabled: !!companyId,
    staleTime: 30000,
  });
};

export const useApproveFee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (feeId: number) => companyApi.approveFee(feeId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['company-fees'] });
      toast({ variant: 'success', title: 'Success!', description: data.message || 'Fee approved successfully' });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to approve fee', variant: 'destructive' });
    },
  });
};

// ADD after useApproveFee:
export const useRejectCompanyFee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      companyApi.rejectFee(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['company-fees'] });
      toast({ variant: 'success', title: 'Success!', description: data.message || 'Fee rejected' });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to reject fee', variant: 'destructive' });
    },
  });
};

export const useReactivateCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => companyApi.reactivateCompany(id),
    onSuccess: (data: CompanyActionResponse) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: data.message || 'Company reactivated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['company'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reactivate company';
      toast({
        title: 'Reactivation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });
};

export const useCompanyFullDetails = (id: number | null) => {
  return useQuery({
    queryKey: ['company-full-details', id],
    queryFn: () => companyApi.getCompanyFullDetails(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => companyApi.deleteCompany(id),
    onSuccess: (data: CompanyActionResponse) => {
      toast({
        variant: 'success',
        title: 'Success!',
        description: data.message || 'Company deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast({
        title: 'Deletion Failed',
        description: error.response?.data?.message || error.message || 'Failed to delete company',
        variant: 'destructive',
      });
    },
  });
};