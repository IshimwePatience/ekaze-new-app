export interface PoliceLocation {
  district: string | null;
  sector: string | null;
  cell: string | null;
  village: string | null;
  address: string | null;
}

export interface PoliceStatistics {
  total_incidents: number;
  pending_incidents: number;
  investigating_incidents: number;
  resolved_incidents: number;
  closed_incidents: number;
  verified_reports: number;
  this_month_incidents: number;
  escalated_incidents: number;
}

export interface RecentIncident {
  id: number;
  incident_type: string;
  severity_level: string;
  status: string;
  created_at: string;
  is_verified: boolean;
  reporter_name: string;
  worker_name: string | null;
  employer_name: string | null;
  company_name: string | null;
}

export interface IncidentByType {
  type: string;
  count: number;
  resolved: number;
}

export interface PoliceProfile {
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
  badge_number: string | null;
  police_station: string | null;
  rank: string | null;
  
  location: PoliceLocation;
  statistics: PoliceStatistics;
  recent_incidents: RecentIncident[];
  incidents_by_type: IncidentByType[];
  
  created_at: string;
  updated_at: string;
}

export interface PoliceProfileResponse {
  success: boolean;
  data: PoliceProfile;
  message?: string;
}

export interface PoliceProfileUpdateRequest {
  // User fields
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  national_id?: string;
  date_of_birth?: string;
  
  // Police-specific fields
  badge_number?: string;
  police_station?: string;
  rank?: string;
  
  // Location fields
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