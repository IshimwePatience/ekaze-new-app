// Company Incident Interfaces
export interface CompanyIncidentWorker {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  user?: {
    phone: string;
    email: string;
    district: string;
    profile_photo: string | null;
  };
}

export interface CompanyIncidentEmployer {
  id: number;
  user?: {
    name: string;
    phone: string;
    email: string;
    district: string;
  };
}

export interface CompanyIncidentOfficer {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface CompanyIncidentItem {
  id: number;
  incident_number: string;
  worker_id: number;
  employer_id: number | null;
  employment_id: number | null;
  company_id: number;
  incident_type: 'theft' | 'violence' | 'negligence' | 'breach_of_contract' | 'misconduct' | 'non_payment' | 'unsafe_conditions' | 'harassment' | 'wrongful_termination' | 'other';
  incident_subtype?: string | null;
  severity?: string;
  description: string;
  incident_date: string;
  incident_location: string | null;
  evidence_files: string[] | null;
  status: 'reported' | 'under_investigation' | 'resolved' | 'dismissed';
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
  worker?: CompanyIncidentWorker;
  employer?: CompanyIncidentEmployer;
  assigned_officer?: CompanyIncidentOfficer;
  can_update?: boolean;
  can_delete?: boolean;
}

export interface CompanyIncidentFilters {
  status?: 'reported' | 'under_investigation' | 'resolved' | 'dismissed';
  incident_type?: 'theft' | 'violence' | 'negligence' | 'breach_of_contract' | 'misconduct' | 'non_payment' | 'unsafe_conditions' | 'harassment' | 'wrongful_termination' | 'other';
  worker_id?: number;
  from_date?: string;
  to_date?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

export interface CompanyIncidentsListData {
  current_page: number;
  data: CompanyIncidentItem[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface CompanyIncidentsResponse {
  success: boolean;
  data: CompanyIncidentsListData;
}

export interface CompanyIncidentDetailsResponse {
  success: boolean;
  data: CompanyIncidentItem;
}

export interface CompanyIncidentStatistics {
  total: number;
  by_status: {
    reported: number;
    under_investigation: number;
    resolved: number;
    dismissed: number;
  };
  this_month: number;
  open_cases: number;
}

export interface CompanyIncidentStatisticsResponse {
  success: boolean;
  data: CompanyIncidentStatistics;
}

export interface CompanyWorkerIncidentsResponse {
  success: boolean;
  data: {
    worker: {
      id: number;
      full_name: string;
      total_incidents: number;
    };
    incidents: CompanyIncidentItem[];
  };
}

export interface CompanyCreateIncidentPayload {
  worker_id: number;
  employer_id?: number;
  employment_id?: number;
  incident_type: 'theft' | 'violence' | 'negligence' | 'breach_of_contract' | 'misconduct' | 'non_payment' | 'unsafe_conditions' | 'harassment' | 'wrongful_termination' | 'other';
  incident_subtype?: string | null;
  description: string;
  incident_date: string;
  incident_location?: string;
  province_id?: number | null;
  district_id?: number | null;
  sector_id?: number | null;
  cell_id?: number | null;
  village_id?: number | null;
  evidence_files?: string[];
  notify_police?: boolean;
}

export interface CompanyUpdateIncidentPayload {
  incident_type?: 'theft' | 'violence' | 'negligence' | 'breach_of_contract' | 'misconduct' | 'non_payment' | 'unsafe_conditions' | 'harassment' | 'wrongful_termination' | 'other';
  incident_subtype?: string | null;
  description?: string;
  incident_location?: string;
  evidence_files?: string[];
}

export interface CompanyIncidentActionResponse {
  success: boolean;
  message: string;
  data: CompanyIncidentItem;
}