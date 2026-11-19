import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyFeeApi } from '@/api/companyFeeService';
import { useToast } from '@/hooks/use-toast';
import type { CreateFeeRequest, UpdateFeeRequest, RequestWithdrawalRequest, } from '@/types/company-fee.types';
import { AxiosError } from 'axios';

interface ErrorResponse { message?: string; error?: string; }

export const companyFeeKeys = {
  all: ['company-fees'] as const,
  mine: () => [...companyFeeKeys.all, 'mine'] as const,
};

export const useMyFees = () => {
  return useQuery({
    queryKey: companyFeeKeys.mine(),
    queryFn: () => companyFeeApi.getMyFees(),
    staleTime: 30000,
  });
};

export const useCreateFee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: CreateFeeRequest) => companyFeeApi.createFee(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: companyFeeKeys.all });
      toast({ variant: 'success', title: 'Success', description: response.message });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to create fee', variant: 'destructive' });
    },
  });
};

export const useUpdateFee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFeeRequest }) =>
      companyFeeApi.updateFee(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: companyFeeKeys.all });
      toast({ variant: 'success', title: 'Success', description: response.message });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update fee', variant: 'destructive' });
    },
  });
};

// ADD at end of file:
export const useRejectFee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
      companyFeeApi.rejectFee(id, reason),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: companyFeeKeys.all });
      toast({ variant: 'success', title: 'Fee rejected', description: response.message });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to reject fee', variant: 'destructive' });
    },
  });
};

// ADD at end of file:
export const useCompanyWallet = () => {
  return useQuery({
    queryKey: ['company-wallet'],
    queryFn: () => companyFeeApi.getWallet(),
    staleTime: 30000,
  });
};

export const useRequestWithdrawal = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: RequestWithdrawalRequest) => companyFeeApi.requestWithdrawal(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['company-wallet'] });
      toast({ variant: 'success', title: 'Withdrawal Requested', description: response.message });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to request withdrawal', variant: 'destructive' });
    },
  });
};

export const useUpdateWalletAccount = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (accountNo: string) => companyFeeApi.updateWalletAccount(accountNo),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['company-wallet'] });
      toast({ variant: 'success', title: 'Account Updated', description: response.message });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update account', variant: 'destructive' });
    },
  });
};