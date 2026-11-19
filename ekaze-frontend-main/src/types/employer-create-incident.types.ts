export type EmployerIncidentType =
  | 'theft'
  | 'violence'
  | 'negligence'
  | 'breach_of_contract'
  | 'misconduct'
  | 'other';

export type EmployerIncidentSubtype = string; // flexible per type

// severity removed from request — backend always sets 'medium'
export interface CreateEmployerIncidentRequest {
  worker_id: number;
  incident_type: EmployerIncidentType;
  incident_subtype?: string | null;
  description: string;
  incident_date: string;
  incident_location: string;
  province_id?: number | null;
  district_id?: number | null;
  sector_id?: number | null;
  cell_id?: number | null;
  village_id?: number | null;
  proof_files?: File[];
}

export interface CreateEmployerIncidentResponse {
  success: boolean;
  message: string;
  data: {
    incident: {
      id: number;
      incident_number: string;
      worker_id: number;
      employer_id: number;
      incident_type: EmployerIncidentType;
      incident_subtype: string | null;
      severity: string;
      description: string;
      incident_date: string;
      incident_location: string;
      created_at: string;
      updated_at: string;
    };
  };
}

export interface EmployerActiveWorker {
  id: number;
  worker_id: number;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  average_rating: string;
  availability_status: string;
  profile_photo: string | null;
  phone: string;
  email: string;
  national_id: string;
}

export interface EmployerActiveWorkersResponse {
  success: boolean;
  message: string;
  data: {
    data: EmployerActiveWorker[];
  };
}