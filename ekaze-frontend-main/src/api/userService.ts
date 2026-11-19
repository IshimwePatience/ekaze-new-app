import api from '@/lib/api';
import type {
  UsersResponse,
  UserDetailsResponse,
  UserStatisticsResponse,
  CreateUserRequest,
  UpdateUserRequest,
  SuspendUserRequest,
  ResetPasswordRequest,
  UserActionResponse,
  ActivityLogsResponse,
  UserActivityLogsParams,
  UserActivityDetailsResponse,
  JurisdictionsListResponse,
  JurisdictionResponse,
  CreateJurisdictionRequest,
} from '@/types/user.types';

export const userApi = {
  // Get all users
  getUsers: async (page = 1, params?: {
    role?: string;
    status?: string;
    is_verified?: boolean;
    district?: string;
    from_date?: string;
    to_date?: string;
    search?: string;
    per_page?: number;
  }): Promise<UsersResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<UsersResponse>(`/admin/users?${queryParams.toString()}`);
    return response.data;
  },

  // Get user statistics
  getStatistics: async (): Promise<UserStatisticsResponse> => {
    const response = await api.get<UserStatisticsResponse>('/admin/users/statistics');
    return response.data;
  },

  // Get users by role
  getUsersByRole: async (
    role: string,
    params?: {
      status?: string;
      search?: string;
      per_page?: number;
    }
  ): Promise<UsersResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<UsersResponse>(
      `/admin/users/by-role/${role}?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get users by status
  getUsersByStatus: async (
    status: string,
    params?: {
      role?: string;
      search?: string;
      per_page?: number;
    }
  ): Promise<UsersResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<UsersResponse>(
      `/admin/users/by-status/${status}?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get single user
  getUser: async (id: number): Promise<UserDetailsResponse> => {
    const response = await api.get<UserDetailsResponse>(`/admin/users/${id}`);
    return response.data;
  },

  // Create user
  createUser: async (data: CreateUserRequest): Promise<UserActionResponse> => {
    const response = await api.post<UserActionResponse>('/admin/users', data);
    return response.data;
  },

  // Update user
  updateUser: async (id: number, data: UpdateUserRequest): Promise<UserActionResponse> => {
    const response = await api.put<UserActionResponse>(`/admin/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number): Promise<UserActionResponse> => {
    const response = await api.delete<UserActionResponse>(`/admin/users/${id}`);
    return response.data;
  },

  // Activate user
  activateUser: async (id: number): Promise<UserActionResponse> => {
    const response = await api.post<UserActionResponse>(`/admin/users/${id}/activate`);
    return response.data;
  },

  // Suspend user
  suspendUser: async (id: number, data: SuspendUserRequest): Promise<UserActionResponse> => {
    const response = await api.post<UserActionResponse>(`/admin/users/${id}/suspend`, data);
    return response.data;
  },

  // Verify user
  verifyUser: async (id: number): Promise<UserActionResponse> => {
    const response = await api.post<UserActionResponse>(`/admin/users/${id}/verify`);
    return response.data;
  },

  // Reset password
  resetPassword: async (id: number, data: ResetPasswordRequest): Promise<UserActionResponse> => {
    const response = await api.post<UserActionResponse>(`/admin/users/${id}/reset-password`, data);
    return response.data;
  },

  // Confirm employer payment
confirmEmployerPayment: async (id: number): Promise<UserActionResponse> => {
  const response = await api.post<UserActionResponse>(`/admin/users/${id}/confirm-payment`);
  return response.data;
},


// Verify OTP
verifyOtp: async (id: number): Promise<UserActionResponse> => {
  const response = await api.post<UserActionResponse>(`/admin/users/${id}/verify-otp`);
  return response.data;
},

// Reset OTP Block
resetOtpBlock: async (id: number): Promise<UserActionResponse> => {
  const response = await api.post<UserActionResponse>(`/admin/users/${id}/reset-otp-block`);
  return response.data;
},

  // Get activity logs
  getActivityLogs: async (
    id: number, 
    params?: UserActivityLogsParams | number, 
    per_page = 25
  ): Promise<UserActivityDetailsResponse> => {
    let query = '';
    if (typeof params === 'number') {
      query = `page=${params}&per_page=${per_page}`;
    } else if (params) {
      const qp = new URLSearchParams();
      if (params.page) qp.append('page', params.page.toString());
      if (params.per_page) qp.append('per_page', params.per_page.toString());
      if (params.time_filter) qp.append('time_filter', params.time_filter);
      if (params.from_date) qp.append('from_date', params.from_date);
      if (params.to_date) qp.append('to_date', params.to_date);
      if (params.type) qp.append('type', params.type);
      query = qp.toString();
    } else {
      query = `page=1&per_page=${per_page}`;
    }

    const response = await api.get<UserActivityDetailsResponse>(
      `/admin/users/${id}/activity-logs?${query}`
    );
    return response.data;
  },

  // Export users
  exportUsers: async (params?: {
    role?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<Blob>(`/admin/users/export/data?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  getOfficerJurisdictions: async (officerId: number): Promise<JurisdictionsListResponse> => {
  const response = await api.get<JurisdictionsListResponse>(
    `/admin/police-jurisdictions/officer/${officerId}`
  );
  return response.data;
},

// Assign jurisdiction
assignJurisdiction: async (data: CreateJurisdictionRequest): Promise<JurisdictionResponse> => {
  const response = await api.post<JurisdictionResponse>('/admin/police-jurisdictions', data);
  return response.data;
},

// Delete jurisdiction
deleteJurisdiction: async (id: number): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/admin/police-jurisdictions/${id}`);
  return response.data;
},
};