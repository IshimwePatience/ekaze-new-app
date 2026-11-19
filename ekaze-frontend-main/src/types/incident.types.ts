
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface Employment {
  id: number;
  worker_id: number;
  employer_id: number;
  company_id: number | null;
  position: string;
  start_date: string;
  end_date: string | null;
  status: 'active' | 'terminated' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface ProofFile {
  id: number;
  incident_id: number;
  file_url: string;
  extension: string;
  size: number;
  created_at: string;
  updated_at: string;
}

export interface Incident {
  id: number;
  incident_number: string;
  worker_id: number;
  employer_id: number | null;
  employment_id: number | null;
  company_id: number | null;
 incident_type: 'theft' | 'violence' | 'negligence' | 'breach_of_contract' | 'misconduct' | 'non_payment' | 'unsafe_conditions' | 'harassment' | 'wrongful_termination' | 'other';
incident_subtype?: string | null;
  description: string;
  incident_date: string;
  incident_location: string | null;
  province_id?: number | null;
district_id?: number | null;
sector_id?: number | null;
cell_id?: number | null;
village_id?: number | null;
  evidence_files: string[] | null;
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
  worker?: {
    id: number;
    first_name: string;
    last_name: string;
    user: {
      id: number;
      name: string;
      email: string;
      phone: string;
      national_id: string;
      profile_photo: string | null;
    };
    company?: {
      id: number;
      business_name: string;
      tin: string;
    };
  };
  employer?: {
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
      phone: string;
      profile_photo?: string | null;
    };
  };
  reporter?: {
    id: number;
    name: string;
    phone?: string;
    profile_photo?: string | null;
  };
  company?: {
    id: number;
    business_name: string;
    tin: string;
  };
  employment?: Employment;
  assignedOfficer?: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  type_label?: string;
  status_label?: string;
  severity_color?: string;
  days_open?: number;
  proof_files?: ProofFile[];
}

export interface IncidentsResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Incident[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface IncidentDetailsResponse {
  success: boolean;
  data: Incident;
}

export interface IncidentStatisticsResponse {
  success: boolean;
  data: {
    total: number;
    by_status: {
      reported: number;
      under_investigation: number;
      resolved: number;
      dismissed: number;
      escalated: number;
    };

by_type: {
  theft: number;
  violence: number;
  negligence: number;
  breach_of_contract: number;
  misconduct: number;
  non_payment: number;
  unsafe_conditions: number;
  harassment: number;
  wrongful_termination: number;
  other: number;
};
    this_month: number;
    this_week: number;
    today: number;
    unassigned: number;
    open_cases: number;
  };
}

export interface CreateIncidentRequest {
  worker_id: number;
  employer_id?: number;
  employment_id?: number;
incident_type: 'theft' | 'violence' | 'negligence' | 'breach_of_contract' | 'misconduct' | 'non_payment' | 'unsafe_conditions' | 'harassment' | 'wrongful_termination' | 'other';
incident_subtype?: string | null;
  description: string;
  incident_date: string;
  incident_location?: string;
  province_id?: number | null;   // ADD
  district_id?: number | null;   // ADD
  sector_id?: number | null;     // ADD
  cell_id?: number | null;       // ADD
  village_id?: number | null;    // ADD
  evidence_files?: string[];
  notify_police?: boolean;
  proof_files?: File[];
}

export interface UpdateIncidentRequest {
incident_type?: 'theft' | 'violence' | 'negligence' | 'breach_of_contract' | 'misconduct' | 'non_payment' | 'unsafe_conditions' | 'harassment' | 'wrongful_termination' | 'other';
incident_subtype?: string | null;
  description?: string;
  incident_date?: string;
  incident_location?: string;
  evidence_files?: string[];
}

export interface AssignOfficerRequest {
  officer_id: number;
}

export interface UpdateStatusRequest {
  status: 'reported' | 'under_investigation' | 'resolved' | 'dismissed' | 'escalated';
  resolution_details?: string;
}

export interface AddNotesRequest {
  notes: string;
}

export interface IncidentActionResponse {
  success: boolean;
  message: string;
  data?: Incident;
}

export interface IncidentTimelineResponse {
  success: boolean;
  data: {
    incident_number: string;
    timeline: Array<{
      event: string;
      timestamp: string;
      status: string;
      officer?: string;
      details?: string;
    }>;
  };
}

export interface AddProofFilesResponse {
  success: boolean;
  message: string;
  data: {
    uploaded: ProofFile[];
    total_files: number;
  };
}

export interface DeleteProofFileResponse {
  success: boolean;
  message: string;
  data: {
    remaining_files: number;
  };
}


