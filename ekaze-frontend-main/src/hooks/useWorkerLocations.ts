import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workerLocationApi } from '@/api/workerLocationService';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import type { SetWorkerLocationRequest } from '@/types/worker-location.types';

interface ApiError { message?: string; }

const locationKeys = {
  all:          ['worker-locations'] as const,
  employer:     () => [...locationKeys.all, 'employer'] as const,
  admin:        (params?: object) => [...locationKeys.all, 'admin', params] as const,
  history:      (workerId: number) => [...locationKeys.all, 'history', workerId] as const,
};

export const useEmployerWorkerLocations = () => {
  return useQuery({
    queryKey: locationKeys.employer(),
    queryFn:  () => workerLocationApi.getEmployerWorkerLocations(),
    staleTime: 30000,
    refetchInterval: 60000, // auto-refresh every 60s
  });
};

export const useSetWorkerLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ workerId, data }: { workerId: number; data: SetWorkerLocationRequest }) =>
      workerLocationApi.setWorkerLocation(workerId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
      toast({ variant: 'success', title: 'Location Updated', description: res.message });
    },
    onError: (e: AxiosError<ApiError>) => {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to update location', variant: 'destructive' });
    },
  });
};

export const useRemoveWorkerLocation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (workerId: number) => workerLocationApi.removeWorkerLocation(workerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
      toast({ variant: 'success', title: 'Removed', description: 'Worker removed from map.' });
    },
    onError: (e: AxiosError<ApiError>) => {
      toast({ title: 'Error', description: e.response?.data?.message || 'Failed to remove', variant: 'destructive' });
    },
  });
};

export const useAdminWorkerLocations = (params?: { district?: string; sector?: string; employer_id?: number }) => {
  return useQuery({
    queryKey: locationKeys.admin(params),
    queryFn:  () => workerLocationApi.getAdminWorkerLocations(params),
    staleTime: 30000,
    refetchInterval: 60000,
  });
};
