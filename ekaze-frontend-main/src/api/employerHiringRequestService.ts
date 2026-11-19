import api from '@/lib/api';
import type { HiringRequestFilters, HiringRequestListResponse, HiringRequestFormData, HiringRequest } from '@/types/employer-hiring-request.types';

export const employerHiringRequestApi = {
  /**
   * Get all hiring requests for employer
   */
  getRequests: async (filters?: Partial<HiringRequestFilters>) => {
    const params = new URLSearchParams();
    
    if (filters?.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters?.from_date) params.append('from_date', filters.from_date);
    if (filters?.to_date) params.append('to_date', filters.to_date);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());

    const response = await api.get<HiringRequestListResponse>(`/employer/hiring-requests?${params.toString()}`);
    return response.data;
  },

  /**
   * Create a new hiring request
   */
  createRequest: async (data: HiringRequestFormData) => {
    const response = await api.post<{ success: boolean; message: string; data: HiringRequest }>(
      '/employer/hiring-requests',
      data
    );
    return response.data;
  },

  /**
   * Get single hiring request details
   */
  getRequest: async (id: number) => {
    const response = await api.get<{ success: boolean; data: HiringRequest }>(`/employer/hiring-requests/${id}`);
    return response.data;
  },

  /**
   * Cancel a hiring request
   */
  cancelRequest: async (id: number) => {
    const response = await api.post<{ success: boolean; message: string }>(`/employer/hiring-requests/${id}/cancel`);
    return response.data;
  },
};