import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentApi } from '@/api/agentService';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { AssignWholesaleRequest, RecordSaleRequest } from '@/types/agent.types';

interface ApiError { message?: string; }

const agentKeys = {
  all:                  ['agents'] as const,
  myWallet:             () => [...agentKeys.all, 'my-wallet'] as const,
  mySales:              (p?: object) => [...agentKeys.all, 'my-sales', p] as const,
  employerAgents:       () => [...agentKeys.all, 'employer-agents'] as const,
  employerAgentDetails: (id: number) => [...agentKeys.all, 'employer-agent', id] as const,
  companyAgents:        () => [...agentKeys.all, 'company-agents'] as const,
  adminAnalytics:       () => [...agentKeys.all, 'admin-analytics'] as const,
  adminAgentDetails:    (id: number) => [...agentKeys.all, 'admin-agent', id] as const,
};

// ── WORKER HOOKS ─────────────────────────────────────────

export const useMyAgentWallet = () =>
  useQuery({ queryKey: agentKeys.myWallet(), queryFn: agentApi.getMyWallet, staleTime: 30000 });

export const useMySales = (params?: { product_type?: string; from_date?: string; to_date?: string; page?: number }) =>
  useQuery({ queryKey: agentKeys.mySales(params), queryFn: () => agentApi.getMySales(params), staleTime: 30000 });

export const useSelfAssignWholesale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: AssignWholesaleRequest) => agentApi.selfAssignWholesale(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
      toast({ variant: 'success', title: 'Wholesale Assigned', description: res.message });
    },
    onError: (e: AxiosError<ApiError>) => {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed', variant: 'destructive' });
    },
  });
};

export const useRecordSale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (data: RecordSaleRequest) => agentApi.recordSale(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
      toast({ variant: 'success', title: 'Sale Recorded', description: res.message });
    },
    onError: (e: AxiosError<ApiError>) => {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to record sale', variant: 'destructive' });
    },
  });
};

// ── EMPLOYER HOOKS ───────────────────────────────────────

export const useEmployerAgentAnalytics = () =>
  useQuery({ queryKey: [...agentKeys.employerAgents(), 'analytics'], queryFn: agentApi.getEmployerAgentAnalytics, staleTime: 30000 });


export const useEmployerAgents = () =>
  useQuery({ queryKey: agentKeys.employerAgents(), queryFn: agentApi.getEmployerAgents, staleTime: 30000 });

export const useEmployerAgentDetails = (workerId: number) =>
  useQuery({ queryKey: agentKeys.employerAgentDetails(workerId), queryFn: () => agentApi.getEmployerAgentDetails(workerId), enabled: !!workerId });

export const useEmployerAssignWholesale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ workerId, data }: { workerId: number; data: AssignWholesaleRequest }) =>
      agentApi.employerAssignWholesale(workerId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
      toast({ variant: 'success', title: 'Wholesale Assigned', description: res.message });
    },
    onError: (e: AxiosError<ApiError>) => {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed', variant: 'destructive' });
    },
  });
};

export const useCompanyAgentAnalytics = () =>
  useQuery({ queryKey: [...agentKeys.companyAgents(), 'analytics'], queryFn: agentApi.getCompanyAgentAnalytics, staleTime: 30000 });


// ── COMPANY HOOKS ────────────────────────────────────────

export const useCompanyAgents = () =>
  useQuery({ queryKey: agentKeys.companyAgents(), queryFn: agentApi.getCompanyAgents, staleTime: 30000 });

export const useCompanyAgentDetails = (workerId: number) =>
  useQuery({ queryKey: [...agentKeys.companyAgents(), 'detail', workerId], queryFn: () => agentApi.getCompanyAgentDetails(workerId), enabled: !!workerId });


export const useCompanyAssignWholesale = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ workerId, data }: { workerId: number; data: AssignWholesaleRequest }) =>
      agentApi.companyAssignWholesale(workerId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
      toast({ variant: 'success', title: 'Wholesale Assigned', description: res.message });
    },
    onError: (e: AxiosError<ApiError>) => {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed', variant: 'destructive' });
    },
  });
};

// ── ADMIN HOOKS ──────────────────────────────────────────

export const useAdminAgentAnalytics = () =>
  useQuery({ queryKey: agentKeys.adminAnalytics(), queryFn: agentApi.getAdminAgentAnalytics, staleTime: 30000 });

export const useAdminAgentDetails = (workerId: number) =>
  useQuery({ queryKey: agentKeys.adminAgentDetails(workerId), queryFn: () => agentApi.getAdminAgentDetails(workerId), enabled: !!workerId });