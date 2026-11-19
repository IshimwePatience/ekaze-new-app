import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { AxiosError } from "axios";
import { workerAvailabilityApi } from "@/api/workerAvailabilityService";
import type { SaveAvailabilityRequest } from "@/types/worker-availability.types";

interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

const QUERY_KEY = "worker-availability";

/**
 * Fetch all active availability slots for the authenticated worker.
 */
export const useAvailabilitySlots = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "slots"],
    queryFn: () => workerAvailabilityApi.getSlots(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch availability + booked shifts merged for the current week.
 */
export const useAvailabilityWeekView = () => {
  return useQuery({
    queryKey: [QUERY_KEY, "week"],
    queryFn: () => workerAvailabilityApi.getWeekView(),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Bulk-save (replace) availability slots.
 */
export const useSaveAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (payload: SaveAvailabilityRequest) =>
      workerAvailabilityApi.saveSlots(payload),
    onSuccess: (data) => {
      toast({
        variant: "success",
        title: "Availability saved!",
        description: data.message || "Your availability has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to save availability";
      const detail = error.response?.data?.error;
      const errors = error.response?.data?.errors;

      toast({
        title: "Save Failed",
        description: errors
          ? Object.values(errors).flat().join(", ")
          : detail
          ? `${msg}: ${detail}`
          : msg,
        variant: "destructive",
      });
    },
  });
};

/**
 * Delete (soft-deactivate) a single availability slot.
 */
export const useDeleteAvailabilitySlot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => workerAvailabilityApi.deleteSlot(id),
    onSuccess: () => {
      toast({
        variant: "success",
        title: "Slot removed",
        description: "Availability slot has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to remove slot";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    },
  });
};

/**
 * Submit a request to the employer to modify or cancel a hired shift.
 */
export const useRequestShiftChange = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        action: 'delete' | 'change';
        new_day_index?: number;
        new_start_time?: string;
        new_end_time?: string;
        reason?: string;
      };
    }) => workerAvailabilityApi.requestShiftChange(id, payload),
    onSuccess: (data) => {
      toast({
        variant: "success",
        title: "Request Sent to Employer",
        description: data.message || "Your request has been submitted to your employer for approval.",
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit shift request";
      toast({
        title: "Request Failed",
        description: msg,
        variant: "destructive",
      });
    },
  });
};