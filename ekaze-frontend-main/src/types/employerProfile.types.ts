export interface EmployerUser {
  name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  national_id: string | null;
  date_of_birth: string | null;
  profile_photo: string | null;
  is_verified: boolean;
}

export interface EmployerLocation {
  district: string | null;
  sector: string | null;
  cell: string | null;
  village: string | null;
  address: string | null;
}

export interface EmploymentStats {
  total_hired: number;
  active_workers: number;
  completed: number;
  terminated: number;
  pending_requests: number;
  total_payments: number;
  total_incidents: number;
  open_incidents: number;
}

export interface WorkerByCategory {
  category: string;
  count: number;
}

export interface RecentWorker {
  name: string;
  company: string;
  role: string;
  start_date: string;
  status: string;
  rating: number | string;
}

export interface RecentPayment {
  amount: number;
  type: string;
  date: string;
  reference: string | null;
}

export interface HiringRequestStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface EmploymentDurationStats {
  average_duration: number;
  min_duration: number;
  max_duration: number;
  total_duration: number;
}

export interface EmployerProfile {
  id: number;
  user_id: number;
  has_paid_registration: boolean;
  registration_paid_at: string | null;
  active_workers: number;
  total_workers_hired: number;
  total_payments_made: number;
  total_incidents_reported: number;
  created_at: string;
  updated_at: string;
  
  user: EmployerUser;
  location: EmployerLocation;
  stats: EmploymentStats;
  average_rating_given: number | string;
  workers_by_category: WorkerByCategory[];
  recent_workers: RecentWorker[];
  recent_payments: RecentPayment[];
  hiring_requests: HiringRequestStats;
  employment_duration: EmploymentDurationStats;
  total_spending: number;
  can_hire: boolean;
}

export interface EmployerProfileResponse {
  success: boolean;
  data: EmployerProfile;
  message?: string;
}

export interface EmployerProfileUpdateRequest {
  // User fields
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  national_id?: string;
  date_of_birth?: string;
  
  // Location fields
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  address?: string;
  
  // Employer fields
  active_workers?: number;
}

export interface PhotoUploadResponse {
  success: boolean;
  message: string;
  photo_url?: string;
}