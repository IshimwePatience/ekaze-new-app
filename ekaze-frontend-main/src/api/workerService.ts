import api from '@/lib/api';
import type {
  WorkersResponse,
  WorkerDetailsResponse,
  WorkerUpdateRequest,
  WorkerActionRequest,
  WorkerActionResponse,
  EmploymentHistoryResponse,
  ProtectedWorkerDetailsResponse,
} from '@/types/worker.types';



export interface PublicWorker {
  created_at: string | number | Date;
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  experience_level: string;
  languages_spoken: string[];
  has_insurance: boolean;
  work_type_preferences: string[];
  preferred_districts: string[];
  preferred_sectors: string[] | null;
  min_salary: string;
  max_salary: string;
  availability_status: string;
  district: string | null;
  sector: string | null;
  profile_photo: string | null;
  average_rating: string;
  total_ratings: number;
  contact_visible: boolean;
  payment_required_message: string;
  registration_type: string;
  fee: number;

}








export interface PublicWorkerDetails {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  experience_level: string;
  languages_spoken: string[];
  has_insurance: boolean;
  insurance_provider: string | null;
  insurance_number: string | null;
  work_type_preferences: string[];
  preferred_districts: string[];
  preferred_sectors: string[] | null;
  min_salary: string;
  max_salary: string;
  availability_status: string;
  district: string | null;
  sector: string | null;
  profile_photo: string | null;
  average_rating: string;
  total_ratings: number;
  email: string | null;
  phone: string | null;
  national_id: string | null;
  referee_1_name: string | null;
  referee_1_phone: string | null;
  referee_1_relationship: string | null;
  referee_2_name: string | null;
  referee_2_phone: string | null;
  referee_2_relationship: string | null;
}

export interface PublicWorkerDetailsResponse {
  success: boolean;
  message: string;
  data: PublicWorkerDetails | null;
  note?: string;
}

export interface PublicWorkerSearchResponse {
  success: boolean;
  message: string;
  data: {
    current_page: number;
    data: PublicWorker[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
      active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
  note?: string;
}

export interface PublicSearchParams {
  gender?: 'male' | 'female';
  min_age?: number;
  max_age?: number;
  district?: string;
  sector?: string;
  min_salary?: number;
  max_salary?: number;
  experience_level?: 'beginner' | 'intermediate' | 'expert';
  has_insurance?: boolean;
  languages?: string[];
  services?: string[];
  education_level?: string;
  min_years_experience?: number;
  max_years_experience?: number;
  available_days?: string[];
  available_weekends?: boolean;
  available_holidays?: boolean;
  has_driving_licence?: boolean;
  has_cooking_certificate?: boolean;
  has_first_aid_certificate?: boolean;
  has_childcare_certificate?: boolean;
  preferred_work_type?: string;
  is_physically_fit?: boolean;
  marital_status?: string;
  registration_type?: string;
  fee?: number;
  // _refresh?: number;
}

export const workerApi = {


  searchPublicWorkers: async (page = 1, params?: PublicSearchParams): Promise<PublicWorkerSearchResponse> => {
    const response = await api.post<PublicWorkerSearchResponse>(
      `/workers/search/public?page=${page}`,
      params || {}
    );
    return response.data;
  },

    // Get public worker details
  getPublicWorkerDetails: async (id: number): Promise<PublicWorkerDetailsResponse> => {
    const response = await api.get<PublicWorkerDetailsResponse>(`/workers/${id}/public`);
    return response.data;
  },

  getWorkersByCompany: async (
    companyId: number, 
    page = 1, 
    params?: {
      status?: string;
      registration_type?: string;
      nida_verified?: boolean;
      search?: string;
      sort_by?: string;
      sort_order?: string;
      per_page?: number;
    }
  ): Promise<WorkersResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<WorkersResponse>(
      `/admin/workers/by-company/${companyId}?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get protected worker details (requires authentication)
  getProtectedWorkerDetails: async (id: number): Promise<ProtectedWorkerDetailsResponse> => {
    const response = await api.get<ProtectedWorkerDetailsResponse>(`/workers/${id}/details`);
    return response.data;
  },
  






  // Get all workers
  getWorkers: async (page = 1, params?: {
    status?: string;
    registration_type?: string;
    company_id?: number;
    nida_verified?: boolean;
    search?: string;
    sort_by?: string;
    sort_order?: string;
    per_page?: number;
  }): Promise<WorkersResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get<WorkersResponse>(`/admin/workers?${queryParams.toString()}`);
    return response.data;
  },

  // Get available workers
  getAvailableWorkers: async (page = 1, perPage = 15): Promise<WorkersResponse> => {
    const response = await api.get<WorkersResponse>(`/admin/workers/available?page=${page}&per_page=${perPage}`);
    return response.data;
  },

  // Get hired workers
  getHiredWorkers: async (page = 1, perPage = 15): Promise<WorkersResponse> => {
    const response = await api.get<WorkersResponse>(`/admin/workers/hired?page=${page}&per_page=${perPage}`);
    return response.data;
  },

  // Get unavailable workers
  getUnavailableWorkers: async (page = 1, perPage = 15): Promise<WorkersResponse> => {
    const response = await api.get<WorkersResponse>(`/admin/workers/unavailable?page=${page}&per_page=${perPage}`);
    return response.data;
  },

  // Get worker details
  getWorkerDetails: async (id: number): Promise<WorkerDetailsResponse> => {
    const response = await api.get<WorkerDetailsResponse>(`/admin/workers/${id}`);
    return response.data;
  },

  // Update worker
  updateWorker: async (id: number, data: WorkerUpdateRequest): Promise<WorkerActionResponse> => {
    const response = await api.put<WorkerActionResponse>(`/admin/workers/${id}`, data);
    return response.data;
  },

  // Verify NIDA
  verifyNida: async (id: number): Promise<WorkerActionResponse> => {
    const response = await api.post<WorkerActionResponse>(`/admin/workers/${id}/verify-nida`);
    return response.data;
  },

  // Suspend worker
  suspendWorker: async (id: number, data: WorkerActionRequest): Promise<WorkerActionResponse> => {
    const response = await api.post<WorkerActionResponse>(`/admin/workers/${id}/suspend`, data);
    return response.data;
  },

  // Reactivate worker
  reactivateWorker: async (id: number): Promise<WorkerActionResponse> => {
    const response = await api.post<WorkerActionResponse>(`/admin/workers/${id}/reactivate`);
    return response.data;
  },

  // Get employment history
  getEmploymentHistory: async (id: number): Promise<EmploymentHistoryResponse> => {
    const response = await api.get<EmploymentHistoryResponse>(`/admin/workers/${id}/employment-history`);
    return response.data;
  },

    // Check if employer already paid for worker contact
  checkPublicHiringPayment: async (workerId: number) => {
    const response = await api.get(`/employer/public-hiring-payment/${workerId}/status`);
    return response;
  },

  // Initiate MTN MoMo payment for worker contact
  initiatePublicHiringPayment: async (workerId: number, phone: string, selectedSlotIds?: Array<number | string>) => {
    const response = await api.post(`/employer/public-hiring-payment/${workerId}/initiate`, {
      phone,
      selected_slot_ids: selectedSlotIds,
    });
    return response;
  },

  // Poll payment status
  pollPublicHiringPayment: async (workerId: number, referenceId: string) => {
    const response = await api.get(`/employer/public-hiring-payment/${workerId}/poll/${referenceId}`);
    return response;
  },

  checkPublicHiringPaymentByIds: async (employerId: number, workerId: number) => {
    const response = await api.post(`/employer/public-hiring-payment/check-status`, {
      employer_id: employerId,
      worker_id: workerId,
    });
    return response;
  },

  // Get worker analytics
  getWorkerAnalytics: async (id: number) => {
    const response = await api.get(`/admin/analytics/employment/worker/${id}/history`);
    return response.data;
  },

  // Get analytics summary
  getAnalyticsSummary: async () => {
    const response = await api.get(`/admin/analytics/employment/summary`);
    return response.data;
  },

exportWorkerAnalytics: async (id: number, format: 'csv' | 'pdf') => {
    const response = await api.get(
      `/admin/analytics/employment/worker/${id}/export?format=${format}`,
      { responseType: 'blob' }
    );
    const blob = new Blob([response.data], {
      type: format === 'pdf' ? 'application/pdf' : 'text/csv',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `worker_analytics_${id}_${new Date().toISOString().slice(0,10)}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // Delete worker
  deleteWorker: async (id: number): Promise<WorkerActionResponse> => {
    const response = await api.delete<WorkerActionResponse>(`/admin/workers/${id}`);
    return response.data;
  },
};


