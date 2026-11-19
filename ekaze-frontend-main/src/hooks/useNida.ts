import { useMutation } from '@tanstack/react-query';
import { nidaApi } from '@/api/nidaService';
import { AxiosError } from 'axios';

interface ApiError { message?: string; }

export const useNidaCheck = () =>
  useMutation({
    mutationFn: (nid: string) => nidaApi.check(nid),
    onError: (e: AxiosError<ApiError>) => {
      console.error('NIDA check failed:', e.response?.data?.message);
    },
  });

export const useNidaVerify = () =>
  useMutation({
    mutationFn: (payload: { nid: string; fullname?: string; date_of_birth?: string }) =>
      nidaApi.verify(payload),
    onError: (e: AxiosError<ApiError>) => {
      console.error('NIDA verify failed:', e.response?.data?.message);
    },
  });