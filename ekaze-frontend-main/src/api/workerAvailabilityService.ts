import api from "@/lib/api";
import type {
  AvailabilitySlotsResponse,
  SaveAvailabilityRequest,
  WeekViewResponse,
} from "@/types/worker-availability.types";

export const workerAvailabilityApi = {
  /**
   * GET /api/v1/worker/availability
   */
  getSlots: async (): Promise<AvailabilitySlotsResponse> => {
    const response = await api.get<AvailabilitySlotsResponse>(
      "/worker/availability"
    );
    return response.data;
  },

  /**
   * POST /api/v1/worker/availability
   * Bulk-replaces all slots.
   */
  saveSlots: async (
    payload: SaveAvailabilityRequest
  ): Promise<AvailabilitySlotsResponse> => {
    const response = await api.post<AvailabilitySlotsResponse>(
      "/worker/availability",
      payload
    );
    return response.data;
  },

  /**
   * GET /api/v1/worker/availability/week
   * Returns availability + booked shifts for the current week.
   */
  getWeekView: async (): Promise<WeekViewResponse> => {
    const response = await api.get<WeekViewResponse>(
      "/worker/availability/week"
    );
    return response.data;
  },

  /**
   * DELETE /api/v1/worker/availability/:id
   */
  deleteSlot: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/worker/availability/${id}`
    );
    return response.data;
  },

  /**
   * POST /api/v1/worker/availability/:id/request-change
   * Request permission from employer to change or cancel a booked shift.
   */
  requestShiftChange: async (
    id: number,
    payload: {
      action: 'delete' | 'change';
      new_day_index?: number;
      new_start_time?: string;
      new_end_time?: string;
      reason?: string;
    }
  ): Promise<{ success: boolean; message: string; data: any }> => {
    const response = await api.post<{ success: boolean; message: string; data: any }>(
      `/worker/availability/${id}/request-change`,
      payload
    );
    return response.data;
  },
};