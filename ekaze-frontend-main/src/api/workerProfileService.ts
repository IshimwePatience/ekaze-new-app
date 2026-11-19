import api from '@/lib/api';
import type {
  WorkerDashboardResponse,
  WorkerProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  EmploymentsResponse,
  EmploymentFilters,
  RatingsResponse,
  RatingFilters,
  UpdateAvailabilityRequest,
  UpdateAvailabilityResponse,
} from '@/types/worker-profile.types';

export const workerProfileApi = {
  // Get worker dashboard
  getDashboard: async (): Promise<WorkerDashboardResponse> => {
    const response = await api.get<WorkerDashboardResponse>('/worker/dashboard');
    return response.data;
  },

  // Get worker profile
  getProfile: async (): Promise<WorkerProfileResponse> => {
    const response = await api.get<WorkerProfileResponse>('/worker/profile');
    return response.data;
  },

  // Update worker profile
  updateProfile: async (data: UpdateProfileRequest): Promise<UpdateProfileResponse> => {
    const formData = new FormData();
    
    // Append all fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'profile_photo' && value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    const response = await api.put<UpdateProfileResponse>('/worker/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get employment history
  getEmployments: async (filters?: EmploymentFilters): Promise<EmploymentsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await api.get<EmploymentsResponse>(
      `/worker/employments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  },

  // Get ratings/reviews
  getRatings: async (filters?: RatingFilters): Promise<RatingsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await api.get<RatingsResponse>(
      `/worker/ratings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    );
    return response.data;
  },

  // Update availability status
  updateAvailability: async (
    data: UpdateAvailabilityRequest
  ): Promise<UpdateAvailabilityResponse> => {
    const response = await api.put<UpdateAvailabilityResponse>(
      '/worker/availability',
      data
    );
    return response.data;
  },
};