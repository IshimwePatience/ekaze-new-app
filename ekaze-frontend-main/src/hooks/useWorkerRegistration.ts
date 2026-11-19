import { useMutation, useQueryClient } from '@tanstack/react-query';
import { companyApi } from '@/api/companyService';
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { NewWorkerRegistrationPayload, FinalizeWorkerRegistrationPayload } from '@/types/company.types';

export const useCreateNewWorker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: NewWorkerRegistrationPayload) => companyApi.createNewWorker(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-workers'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      console.log('❌ createNewWorker error:', err?.response?.data);
    },
  });
};


// ── Add this mutation hook ────────────────────────────────────────────
export const useImportWorkersExcel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post("/auth/register/workers/import", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      const imported = data?.data?.imported_count ?? 0;
      const skipped = data?.data?.skipped_count ?? 0;
      const msg = skipped > 0
        ? `${imported} worker(s) imported. ${skipped} skipped (already registered).`
        : `${imported} worker(s) imported successfully.`;
      toast({
        title: "Success",
        description: msg,
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["company-workers"] });
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        title: "Failed",
        description: err?.response?.data?.message || "Import failed. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useFinalizeWorkerRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FinalizeWorkerRegistrationPayload) => companyApi.finalizeWorkerRegistration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-workers'] });
    },
  });
};

export const useGenerateBusinessCards = () => {
  return useMutation({
    mutationFn: (input: number[] | { workerIds: number[]; payPhone?: string }) => {
      const workerIds = Array.isArray(input) ? input : input.workerIds;
      const payPhone = Array.isArray(input) ? undefined : input.payPhone;
      return companyApi.generateBusinessCards({ worker_ids: workerIds, ...(payPhone ? { pay_phone: payPhone } : {}) });
    },
  });
};