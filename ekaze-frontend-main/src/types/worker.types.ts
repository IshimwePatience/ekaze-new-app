export interface User {
  id: number;
  role: string;
  name: string;
  email: string;
  phone: string;
  national_id: string;
  gender: string;
  date_of_birth: string;
  province?: string;
  profile_photo: string | null;
  status: string;
  is_verified: boolean;
  verified_at: string | null;
  address: string | null;
  district: string;
  sector: string;
  cell: string | null;
  village: string | null;
  email_verified_at: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Company {
  id: number;
  user_id: number;
  tin: string;
  business_name: string;
  physical_address: string;
  logo: string | null;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  status: string;
  approved_at: string | null;
  approved_by: number | null;
  rejection_reason: string | null;
  subscription_fee: string;
  salary_deduction_percentage: string;
  total_workers: number;
  active_workers: number;
  total_revenue: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CurrentEmployment {
  id: number;
  worker_id: number;
  employer_id: number;
  company_id: number | null;
  hiring_request_id: number;
  agreed_salary: string;
  subscription_fee: string;
  salary_deduction_percentage: string;
  status: string;
  start_date: string;
  end_date: string | null;
  duration_days: number | null;
  work_description: string;
  termination_reason: string | null;
  termination_details: string | null;
  otp_verified: boolean;
  otp_verified_at: string | null;
  service_card_generated: boolean;
  service_card_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  employer?: {
    id: number;
    user: User;
  };
}



export interface Employment {
  id: number;
  worker_id: number;
  employer_id: number;
  company_id: number | null;
  hiring_request_id: number;
  agreed_salary: string;
  status: string;
  start_date: string;
  end_date: string | null;
  duration_days: number | null;
  work_description: string;
  created_at: string;
  updated_at: string;
  employer?: {
    user: User;
  };
}

export interface Rating {
  id: number;
  worker_id: number;
  employer_id: number;
  employment_id: number;
  rating: number;
  review: string | null;
  created_at: string;
  employer?: {
    user: User;
  };
}

export interface Incident {
  id: number;
  worker_id: number;
  employer_id: number;
  employment_id: number;
  incident_type: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
  employer?: {
    user: User;
  };
}


export interface ProtectedWorkerDetailsResponse {
  success: boolean;
  message: string;
  data: ProtectedWorkerDetails | null;
}


export interface ProtectedWorkerDetails {
  // Basic Info
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  age: number;
  registration_type: string;
  fee: number;
  
  // User Info
  email: string;
  phone: string;
  national_id: string;
  gender: string;
  date_of_birth: string | null;
  profile_photo: string | null;
  
  // Location
  district: string | null;
  sector: string | null;
  cell: string | null;
  village: string | null;
  full_address: string;
  preferred_districts: string[];
  preferred_sectors: string[] | null;
  
  // Work Info
  experience_level: string;
  languages_spoken: string[];
  work_type_preferences: string[];
  min_salary: string;
  max_salary: string;
  salary_range_formatted: string;
  
  // Insurance
  has_insurance: boolean;
  insurance_provider: string | null;
  insurance_number: string | null;
  
  // Status
  availability_status: string;
  nida_verified: boolean;
  nida_verified_at: string | null;
  
  // Ratings
  average_rating: string;
  total_ratings: number;
  rating_stars: string;
  
  // Statistics
  total_employments: number;
  total_incidents: number;
  total_employment_days: number;
  
  // References
  referee_1_name: string | null;
  referee_1_phone: string | null;
  referee_1_relationship: string | null;
  referee_2_name: string | null;
  referee_2_phone: string | null;
  referee_2_relationship: string | null;
  
  // Company
  company_id: number | null;
  company_name: string | null;
  company_phone: string | null;
  company_email: string | null;
  
  // Current Employment
  current_employment: CurrentEmployment | null;
  
  // History
  employment_history: EmploymentHistory[];
  ratings: Rating[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CurrentEmployment {
  id: number;
  employer_name: string;
  employer_phone: string | null;
  company_name: string | null;
  agreed_salary: string;
  start_date: string;
  duration_days: number | null;
  formatted_duration: string;
  work_description: string | null;
  status: string;
}

export interface EmploymentHistory {
  id: number;
  employer_name: string;
  employer_phone: string | null;
  company_name: string | null;
  agreed_salary: string;
  start_date: string;
  end_date: string | null;
  duration_days: number | null;
  formatted_duration: string;
  work_description: string | null;
  status: string;
  termination_reason: string | null;
  otp_verified: boolean;
  has_rating: boolean;
}

export interface Rating {
  id: number;
  rating: number;
  review: string | null;
  rating_categories: unknown;
  employer_name: string;
  created_at: string;
  is_verified: boolean;
}

export interface Worker {
  id: number;
  user_id: number;
  company_id: number | null;
  registration_type: 'company' | 'freelance';
  fee: number;
  first_name: string;
  last_name: string;
  age: number;
  experience_level: 'entry' | 'intermediate' | 'expert';
  languages_spoken: string[];
  has_insurance: boolean;
  insurance_provider: string | null;
  insurance_number: string | null;
  work_type_preferences: string[];
  preferred_districts: string[];
  preferred_sectors: string[] | null;
  min_salary: string;
  max_salary: string;
  availability_status: 'available' | 'hired' | 'unavailable';
  referee_1_name: string | null;
  referee_1_phone: string | null;
  referee_1_relationship: string | null;
  referee_2_name: string | null;
  referee_2_phone: string | null;
  referee_2_relationship: string | null;
  average_rating: string;
  total_ratings: number;
  total_employments: number;
  total_incidents: number;
  nida_verified: boolean;
  nida_verified_at: string | null;
  service_card_qr: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  employments_count: number;
  ratings_count: number;
  incidents_count: number;
  user: User;
  company: Company | null;
  current_employment: CurrentEmployment | null;
  employments?: Employment[];
  ratings?: Rating[];
  incidents?: Incident[];
}

export interface WorkerStatistics {
  total_jobs: number;
  active_jobs: number;
  completed_jobs: number;
  average_rating: string;
  total_earnings: string;
  total_days_employed: number;
}

export interface PaginationLinks {
  url: string | null;
  label: string;
  page: number | null;
  active: boolean;
}

export interface WorkersPagination {
  current_page: number;
  data: Worker[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLinks[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface WorkersResponse {
  success: boolean;
  data: WorkersPagination;
  message?: string;
}

export interface WorkerDetailsResponse {
  success: boolean;
  data: {
    worker: Worker;
    statistics: WorkerStatistics;
  };
}

export interface WorkerUpdateRequest {
  first_name?: string;
  last_name?: string;
  age?: number;
  experience_level?: 'entry' | 'intermediate' | 'expert';
  languages_spoken?: string[];
  has_insurance?: boolean;
  insurance_provider?: string | null;
  insurance_number?: string | null;
  availability_status?: 'available' | 'hired' | 'unavailable';
}

export interface WorkerActionRequest {
  suspension_reason?: string;
}

export interface WorkerActionResponse {
  success: boolean;
  message: string;
  data?: Worker;
}

export interface AnalyticsRecord {
  id: number;
  employment_id: number;
  employer_id: number;
  start_date: string;
  end_date: string | null;
  duration_days: number | null;
  duration_category: 'short_term' | 'medium_term' | 'long_term' | 'active';
  ended_reason: 'completed' | 'terminated' | 'suspended' | null;
  is_finalized: boolean;
  employer?: {
    user: {
      name: string;
    };
  };
}

export interface WorkerAnalyticsResponse {
  success: boolean;
  data: {
    worker: {
      id: number;
      first_name: string;
      last_name: string;
      is_frequent_changer: boolean;
      total_employers_count: number;
    };
    analytics: AnalyticsRecord[];
    summary: {
      total_employments: number;
      total_days_employed: number;
      short_term_count: number;
      medium_term_count: number;
      long_term_count: number;
      active_count: number;
      is_frequent_changer: boolean;
      total_employers_count: number;
    };
  };
}

export interface EmploymentHistoryResponse {
  success: boolean;
  data: {
    worker: {
      id: number;
      first_name: string;
      last_name: string;
    };
    employments: Employment[];
    total_days_employed: number;
  };
}