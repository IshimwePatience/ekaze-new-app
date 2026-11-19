import api from '@/lib/api';
import type {
  CompaniesResponse,
  CompanyDetailsResponse,
  CompanyActionRequest,
  CompanyActionResponse,
  CompanyDashboardResponse,
  CompanyAnalyticsResponse,
  WorkerListParams,
  WorkersListResponse,
  WorkerDetailsResponse,
  WorkerRegistrationData,
  WorkerRegistrationResponse,
  WorkerUpdateData,
  EmploymentHistoryResponse,
  NewWorkerRegistrationPayload,
  NewWorkerRegistrationResult,
  FinalizeWorkerRegistrationPayload,
  FinalizeWorkerRegistrationResult,
  WorkerFilters,
  CompanyListItem,
} from '@/types/company.types';
import { WorkerActionResponse } from '@/types/worker.types';

export const companyApi = {
  // Get all companies
  getCompanies: async (page = 1): Promise<CompaniesResponse> => {
    const response = await api.get<CompaniesResponse>(`/admin/companies?page=${page}`);
    return response.data;
  },

getCompaniesList: async (): Promise<CompanyListItem[]> => {
  const response = await api.get<{ success: boolean; data: CompanyListItem[] }>('/employer/companies/list');
  return response.data.data;
},
    // Workers Management
  getWorkers: async (params?: WorkerListParams): Promise<WorkersListResponse> => {
    const response = await api.get('/company/workers', { params });
    return response.data;
  },

    // ADD THIS METHOD HERE
  getCompanyWorkers: async (page: number = 1, params?: Omit<WorkerFilters, 'page'>): Promise<WorkersListResponse> => {
    const response = await api.get(`/company/workers?page=${page}`, { params });
    return response.data;
  },

  

  // Add these TWO methods to your existing companyApi object

  createNewWorker: async (data: NewWorkerRegistrationPayload): Promise<NewWorkerRegistrationResult> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await api.post('/company/workers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  finalizeWorkerRegistration: async (data: FinalizeWorkerRegistrationPayload): Promise<FinalizeWorkerRegistrationResult> => {
    const response = await api.post('/company/workers/complete-registration', data);
    return response.data;
  },

  getWorkerDetails: async (id: number): Promise<WorkerDetailsResponse> => {
    const response = await api.get(`/company/workers/${id}`);
    return response.data;
  },

  registerWorker: async (data: WorkerRegistrationData): Promise<WorkerRegistrationResponse> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await api.post('/company/workers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  

  
  updateWorker: async (id: number, data: WorkerUpdateData): Promise<WorkerActionResponse> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    let response;
    try {
      response = await api.put(`/company/workers/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (err: any) {
      if (err?.response?.status === 404 || err?.response?.status === 405) {
        response = await api.post(`/company/workers/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          params: { _method: 'PUT' },
        });
      } else {
        throw err;
      }
    }
    return response.data;
  },



  getCompanyWorkerDetails: async (id: number): Promise<WorkerDetailsResponse> => {
    const response = await api.get(`/company/workers/${id}`);
    return response.data;
  },

  getCompanyWorkerEmploymentHistory: async (id: number): Promise<EmploymentHistoryResponse> => {
    const response = await api.get(`/company/workers/${id}/history`);
    return response.data;
  },

  markCompanyWorkerAvailable: async (id: number): Promise<WorkerActionResponse> => {
    const response = await api.post(`/company/workers/${id}/mark-available`);
    return response.data;
  },

  deleteCompanyWorker: async (id: number): Promise<WorkerActionResponse> => {
    const response = await api.delete(`/company/workers/${id}`);
    return response.data;
  },

  suspendCompanyWorker: async (id: number): Promise<WorkerActionResponse> => {
    const response = await api.post(`/company/workers/${id}/suspend`);
    return response.data;
  },

  reactivateCompanyWorker: async (id: number): Promise<WorkerActionResponse> => {
    const response = await api.post(`/company/workers/${id}/reactivate`);
    return response.data;
  },

  updateCompanyWorker: async (id: number, data: any): Promise<WorkerActionResponse> => {
    const response = await api.put(`/company/workers/${id}`, data);
    return response.data;
  },

  deleteWorker: async (id: number): Promise<WorkerActionResponse> => {
    const response = await api.delete(`/company/workers/${id}`);
    return response.data;
  },

  markWorkerAvailable: async (id: number): Promise<WorkerActionResponse> => {
    const response = await api.post(`/company/workers/${id}/mark-available`);
    return response.data;
  },

  getWorkerEmploymentHistory: async (id: number): Promise<EmploymentHistoryResponse> => {
    const response = await api.get(`/company/workers/${id}/history`);
    return response.data;
  },


    // Company Dashboard
  getDashboard: async (): Promise<CompanyDashboardResponse> => {
    const response = await api.get('/company/dashboard');
    return response.data;
  },

  // Company Analytics
  getAnalytics: async (period: number = 30): Promise<CompanyAnalyticsResponse> => {
    const response = await api.get(`/company/analytics?period=${period}`);
    return response.data;
  },
  // Get pending companies
  getPendingCompanies: async (): Promise<CompaniesResponse> => {
    const response = await api.get<CompaniesResponse>('/admin/companies/pending');
    return response.data;
  },

    // Get approved companies
  getApprovedCompanies: async (): Promise<CompaniesResponse> => {
    const response = await api.get<CompaniesResponse>('/admin/companies/approved');
    return response.data;
  },

  // Get suspended companies
  getSuspendedCompanies: async (): Promise<CompaniesResponse> => {
    const response = await api.get<CompaniesResponse>('/admin/companies/suspended');
    return response.data;
  },

  // Get company details
  getCompanyDetails: async (id: number): Promise<CompanyDetailsResponse> => {
    const response = await api.get<CompanyDetailsResponse>(`/admin/companies/${id}`);
    return response.data;
  },

  // Approve company
  approveCompany: async (id: number): Promise<CompanyActionResponse> => {
    const response = await api.post<CompanyActionResponse>(`/admin/companies/${id}/approve`);
    return response.data;
  },

  // Reject company
  rejectCompany: async (id: number, data: CompanyActionRequest): Promise<CompanyActionResponse> => {
    const response = await api.post<CompanyActionResponse>(`/admin/companies/${id}/reject`, data);
    return response.data;
  },

  // Suspend company
  suspendCompany: async (id: number, data: CompanyActionRequest): Promise<CompanyActionResponse> => {
    const response = await api.post<CompanyActionResponse>(`/admin/companies/${id}/suspend`, data);
    return response.data;
  },

  generateBusinessCards: async (payload: { worker_ids: number[]; pay_phone?: string }) => {
  const response = await api.post('/company/workers/business-cards/generate', payload);
  return response.data;
},

checkCardPaymentStatus: async (referenceId: string) => {
  const response = await api.get(`/payments/status/${referenceId}`);
  return response.data;
},

getCompanyFees: async (companyId: number) => {
  const response = await api.get(`/admin/company-fees?company_id=${companyId}`);
  return response.data;
},

// Approve a fee (admin)
approveFee: async (feeId: number) => {
  const response = await api.post(`/admin/company-fees/${feeId}/approve`);
  return response.data;
},

rejectFee: async (feeId: number, reason?: string) => {
  const response = await api.post(`/admin/company-fees/${feeId}/reject`, { rejection_reason: reason });
  return response.data;
},

reactivateCompany: async (id: number): Promise<CompanyActionResponse> => {
  const response = await api.post<CompanyActionResponse>(`/admin/companies/${id}/reactivate`);
  return response.data;
},

adjustCompanyTrial: async (id: number, data: { days_to_add?: number; set_trial_days?: number; trial_ends_at?: string }) => {
  const response = await api.post(`/company/${id}/adjust-trial`, data);
  return response.data;
},

getCompanyFullDetails: async (id: number) => {
  const response = await api.get(`/admin/companies/${id}/details`);
  return response.data;
},

deleteCompany: async (id: number): Promise<CompanyActionResponse> => {
  const response = await api.delete<CompanyActionResponse>(`/admin/companies/${id}`);
  return response.data;
},

};