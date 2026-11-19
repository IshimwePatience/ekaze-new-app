export interface SupervisorLocation {
  district: string | null;
  sector: string | null;
  cell: string | null;
  village: string | null;
  address: string | null;
}

export interface SupervisorStatistics {
  // Company stats
  total_companies: number;
  pending_companies: number;
  approved_companies: number;
  rejected_companies: number;
  
  // Employer stats
  total_employers: number;
  active_employers: number;
  employers_paid: number;
  
  // Worker stats
  total_workers: number;
  available_workers: number;
  hired_workers: number;
  verified_workers: number;
  
  // Incident stats
  total_incidents: number;
  open_incidents: number;
  resolved_incidents: number;
  
  // This month stats
  new_companies_this_month: number;
  new_employers_this_month: number;
  new_workers_this_month: number;
  new_incidents_this_month: number;
}

export interface RecentPendingCompany {
  id: number;
  business_name: string;
  tin: string;
  owner_name: string;
  created_at: string;
}

export interface RecentIncident {
  id: number;
  incident_number: string;
  incident_type: string;
  severity: string;
  status: string;
  created_at: string;
  worker_name: string | null;
  employer_name: string | null;
  company_name: string | null;
}

export interface GrowthData {
  month: string;
  companies: number;
  employers: number;
  workers: number;
}

export interface SupervisorProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  national_id: string | null;
  date_of_birth: string | null;
  profile_photo: string | null;
  is_verified: boolean;
  verified_at: string | null;
  role: string;
  
  location: SupervisorLocation;
  statistics: SupervisorStatistics;
  recent_pending_companies: RecentPendingCompany[];
  recent_incidents: RecentIncident[];
  growth_data: GrowthData[];
  
  created_at: string;
  updated_at: string;
}

export interface SupervisorProfileResponse {
  success: boolean;
  data: SupervisorProfile;
  message?: string;
}

export interface SupervisorProfileUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  national_id?: string;
  date_of_birth?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  address?: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface PhotoUploadResponse {
  success: boolean;
  message: string;
  data: {
    profile_photo: string;
  };
}