import api from '@/lib/api';
import type {
  WorkerDashboardResponse,
  WorkerProfileResponse,
  WorkerEmploymentsResponse,
  WorkerRatingsResponse,
  UpdateAvailabilityPayload,
  UpdateAvailabilityResponse,
} from '@/types/worker-owner.types';

export const workerApi = {
  // Get worker dashboard
getDashboard: async (): Promise<WorkerDashboardResponse> => {
  const response = await api.get('/worker/dashboard');
  const data = response.data;
  
  // Transform statistics to match expected structure
  const transformedStats = {
    ...data.data.statistics,
    active_employments: data.data.statistics.active_employment ? 1 : 0,
    completed_employments: Math.max(0, (data.data.statistics.total_employments || 0) - (data.data.statistics.active_employment ? 1 : 0)),
    total_earnings: 0,
    total_hours: 0,
    this_month_earnings: 0,
    this_month_hours: 0,
  };

  // Add user fields to worker object
  const transformedWorker = {
    ...data.data.worker,
    phone: data.data.worker.phone || data.data.user.phone,
    email: data.data.worker.email || data.data.user.email,
    national_id: data.data.worker.national_id || '',
    gender: data.data.worker.gender || 'not_specified',
  };

  return {
    ...data,
    data: {
      ...data.data,
      statistics: transformedStats,
      worker: transformedWorker,
    },
  };
},

  // Get worker profile
  getProfile: async (): Promise<WorkerProfileResponse> => {
    const response = await api.get('/worker/profile');
    return response.data;
  },

  // Update worker profile
  updateProfile: async (data: FormData): Promise<WorkerProfileResponse> => {
    const response = await api.post('/worker/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get employment history
  getEmployments: async (page: number = 1, status?: string): Promise<WorkerEmploymentsResponse> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (status) params.append('status', status);

    const response = await api.get(`/worker/employments?${params.toString()}`);
    return response.data;
  },

  // Get ratings
  getRatings: async (page: number = 1): Promise<WorkerRatingsResponse> => {
    const response = await api.get(`/worker/ratings?page=${page}`);
    return response.data;
  },

  // Update availability status
  updateAvailability: async (data: UpdateAvailabilityPayload): Promise<UpdateAvailabilityResponse> => {
    const response = await api.put('/worker/availability', data);
    return response.data;
  },
};