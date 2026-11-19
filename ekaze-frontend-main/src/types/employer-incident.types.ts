export interface IncidentFilters {
  status?: 'reported' | 'under_investigation' | 'resolved' | 'dismissed' | 'escalated' | 'all';
  incident_type?: 'theft' | 'violence' | 'negligence' | 'breach_of_contract' | 'misconduct' | 'other' | 'all';
  from_date?: string;
  incident_subtype: string | null; 
  to_date?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface Incident {
  id: number;
  incident_number: string;
  worker_id: number;
  employer_id: number;
  employment_id: number;
  company_id: number | null;
  incident_type: 'theft' | 'violence' | 'negligence' | 'breach_of_contract' | 'misconduct' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  incident_subtype: string;
  incident_date: string;
  incident_location: string | null;
  evidence_files: string[];
  status: 'reported' | 'under_investigation' | 'resolved' | 'dismissed' | 'escalated';
  police_notes: string | null;
  assigned_officer_id: number | null;
  assigned_at: string | null;
  resolved_at: string | null;
  resolution_details: string | null;
  worker_notified: boolean;
  company_notified: boolean;
  police_notified: boolean;
  created_at: string;
  updated_at: string;
  worker: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    profile_photo: string | null;
  };
  employment: {
    id: number;
    start_date: string;
    agreed_salary: number | string;
  };
  assigned_officer?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface IncidentFormData {
  worker_id: number;
  incident_type: string;
  description: string;
  incident_subtype?: string;  
  incident_date: string;
  incident_location?: string;
  evidence_files?: File[];
}

export interface IncidentListResponse {
  success: boolean;
  data: {
    data: Incident[];
    current_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}