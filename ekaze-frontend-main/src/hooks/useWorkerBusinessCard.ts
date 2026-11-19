import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workerCardApi } from '@/api/workerCardService';

export const useWorkerCardStatus = () =>
  useQuery({
    queryKey: ['worker-card-status'],
    queryFn: () => workerCardApi.getStatus(),
    staleTime: 30_000,
  });

export const useInitiateCardPayment = () =>
  useMutation({
    mutationFn: (pay_account: string) => workerCardApi.initiatePayment(pay_account),
  });

export const usePollCardPayment = () =>
  useMutation({
    mutationFn: (referenceId: string) => workerCardApi.pollPayment(referenceId),
  });

export const useGenerateCard = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => workerCardApi.generateCard(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['worker-card-status'] });
    },
  });
};