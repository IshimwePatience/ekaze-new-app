import api from '@/lib/api';
import type {
  IncidentsResponse,
  IncidentDetailsResponse,
  IncidentStatisticsResponse,
  CreateIncidentRequest,
  UpdateIncidentRequest,
  AssignOfficerRequest,
  UpdateStatusRequest,
  AddNotesRequest,
  IncidentActionResponse,
  IncidentTimelineResponse,
  AddProofFilesResponse,
  DeleteProofFileResponse,
} from '@/types/incident.types';

const getRolePrefix = (): string => {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      if ((u?.role || '').toLowerCase() === 'supervisor') {
        return '/supervisor';
      }
    }
  } catch {}
  return '/admin';
};

export const incidentApi = {
  // Get all incidents
  getIncidents: async (page = 1, params?: {
    status?: string;
    severity?: string;
    incident_type?: string;
    worker_id?: number;
    company_id?: number;
    employer_id?: number;
    assigned_officer_id?: number;
    from_date?: string;
    to_date?: string;
    search?: string;
    per_page?: number;
  }): Promise<IncidentsResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const prefix = getRolePrefix();
    const response = await api.get<IncidentsResponse>(`${prefix}/incidents?${queryParams.toString()}`);
    return response.data;
  },

  // Get incident statistics
  getStatistics: async (): Promise<IncidentStatisticsResponse> => {
    const prefix = getRolePrefix();
    const response = await api.get<IncidentStatisticsResponse>(`${prefix}/incidents/statistics`);
    return response.data;
  },

  // Get single incident
  getIncident: async (id: number): Promise<IncidentDetailsResponse> => {
    const prefix = getRolePrefix();
    const response = await api.get<IncidentDetailsResponse>(`${prefix}/incidents/${id}`);
    return response.data;
  },

createIncident: async (data: CreateIncidentRequest): Promise<IncidentActionResponse> => {
  const formData = new FormData();

  const skipKeys = ['proof_files'];

  Object.entries(data).forEach(([key, value]) => {
    if (skipKeys.includes(key)) return;
    if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });

  if (data.proof_files?.length) {
    data.proof_files.forEach(file => formData.append('proof_files[]', file));
  }

  const response = await api.post<IncidentActionResponse>('/admin/incidents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
},

  // Update incident
  updateIncident: async (id: number, data: UpdateIncidentRequest): Promise<IncidentActionResponse> => {
    const prefix = getRolePrefix();
    const response = await api.put<IncidentActionResponse>(`${prefix}/incidents/${id}`, data);
    return response.data;
  },

  // Delete incident
  deleteIncident: async (id: number): Promise<IncidentActionResponse> => {
    const prefix = getRolePrefix();
    const response = await api.delete<IncidentActionResponse>(`${prefix}/incidents/${id}`);
    return response.data;
  },

  // Assign officer
  assignOfficer: async (id: number, data: AssignOfficerRequest): Promise<IncidentActionResponse> => {
    const response = await api.post<IncidentActionResponse>(`/admin/incidents/${id}/assign-officer`, data);
    return response.data;
  },

  // Update status
  updateStatus: async (id: number, data: UpdateStatusRequest): Promise<IncidentActionResponse> => {
    const response = await api.post<IncidentActionResponse>(`/admin/incidents/${id}/update-status`, data);
    return response.data;
  },

  // Add notes
  addNotes: async (id: number, data: AddNotesRequest): Promise<IncidentActionResponse> => {
    const response = await api.post<IncidentActionResponse>(`/admin/incidents/${id}/add-notes`, data);
    return response.data;
  },

  // Get timeline
  getTimeline: async (id: number): Promise<IncidentTimelineResponse> => {
    const response = await api.get<IncidentTimelineResponse>(`/admin/incidents/${id}/timeline`);
    return response.data;
  },

// Export incidents
  exportIncidents: async (params?: {
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
    
    const response = await api.get<Blob>(`/admin/incidents/export/data?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Add this to your incident.api.ts
getIncidentsByStatus: async (
  status: string,
  params?: {
    severity?: string;
    incident_type?: string;
    search?: string;
    per_page?: number;
  }
): Promise<IncidentsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
  }
  
  const response = await api.get<IncidentsResponse>(
    `/admin/incidents/by-status/${status}?${queryParams.toString()}`
  );
  return response.data;
},

// ADD before closing };
addProofFiles: async (id: number, files: File[]): Promise<AddProofFilesResponse> => {
  const formData = new FormData();
  files.forEach(file => formData.append('proof_files[]', file));
  const response = await api.post<AddProofFilesResponse>(
    `/admin/incidents/${id}/proof-files`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return response.data;
},

deleteProofFile: async (incidentId: number, fileId: number): Promise<DeleteProofFileResponse> => {
  const response = await api.delete<DeleteProofFileResponse>(
    `/admin/incidents/${incidentId}/proof-files/${fileId}`
  );
  return response.data;
},
};