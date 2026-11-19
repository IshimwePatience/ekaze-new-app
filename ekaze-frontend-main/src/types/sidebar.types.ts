// Sidebar Types
export interface SidebarUserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  profile_photo: string | null;
  status: string;
  is_verified: boolean;
  address: {
    district: string;
    sector: string;
    cell: string | null;
    village: string | null;
    full_address: string;
  };
  created_at: string;
  employer?: {
    id: number;
    has_paid_registration: boolean;
    active_workers: number;
    total_workers_hired: number;
  };
  company?: {
    id: number;
    business_name: string;
    tin: string;
    logo: string | null;
    status: string;
    total_workers: number;
    active_workers: number;
    subscription_fee: string;
  };
}

export interface SidebarWorker {
  id: number;
  name: string;
  type: string;
  status: string;
  hired_at: string;
  duration: string;
  profile_photo: string;
}

export interface SidebarStatistics {
  active_workers: number;
  this_month_spent: string;
}

export interface SidebarData {
  user: SidebarUserProfile;
  statistics: SidebarStatistics;
  recent_workers: SidebarWorker[];
}

// Company Sidebar Types
export interface CompanyAnalyticsData {
  employment_stats: {
    total: number;
    active: number;
    completed: number;
    average_duration: number | null;
  };
  revenue_trends: Array<{
    date: string;
    total: string;
  }>;
  worker_growth: Array<{
    date: string;
    count: number;
  }>;
  rating_distribution: Array<{
    rating: string;
    count: number;
  }>;
  incident_trends: Array<{
    date: string;
    count: number;
  }>;
}

export interface CompanyWorker {
  id: number;
  user_id: number;
  company_id: number;
  name: string;
  registration_type: string;
  first_name: string;
  last_name: string;
  age: number;
  experience_level: string;
  languages_spoken: string[];
  has_insurance: boolean;
  insurance_provider: string | null;
  insurance_number: string | null;
  work_type_preferences: string[];
  preferred_districts: string[];
  preferred_sectors: string[];
  min_salary: string;
  max_salary: string;
  availability_status: string;
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
  user: {
    id: number;
    role: string;
    name: string;
    email: string;
    phone: string;
    national_id: string;
    gender: string;
    date_of_birth: string;
    profile_photo: string | null;
    status: string;
    otp_verified: boolean;
    otp_resend_count: number;
    otp_blocked_until: string | null;
    is_verified: boolean;
    verified_at: string | null;
    address: string | null;
    province: string | null;
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
  };
  current_employment: {
    id: number;
    employer_id: number;
    start_date: string;
  } | null;
}

export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface CompanyWorkersResponse {
  success: boolean;
  data: {
    current_page: number;
    data: CompanyWorker[];
    first_page_url?: string;
    from?: number;
    last_page?: number;
    last_page_url?: string;
    links?: PaginationLink[];
    next_page_url?: string | null;
    path?: string;
    per_page?: number;
    prev_page_url?: string | null;
    to?: number;
    total?: number;
  };
}
export interface CompanyStatistics {
  total_workers: number;
  active_workers: number;
  active_employments: number;
  this_month_revenue: string;
  revenue_growth_percentage: number;
}

export interface CompanySidebarData {
  user: SidebarUserProfile;
  statistics: CompanyStatistics;
  recent_workers: CompanyWorker[];
}

// API Response Types
export interface UserProfileResponse {
  success: boolean;
  user: SidebarUserProfile;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: {
    statistics: {
      workers: {
        active: number;
        total_hired: number;
        available: number;
        terminated: number;
      };
      transactions: {
        total_spent: string;
        this_month_spent: string;
        last_month_spent: string;
        today_spent: string;
        pending_payments: number;
        completed_payments: number;
      };
    };
    recent_activities: {
      recent_workers: SidebarWorker[];
    };
  };
}

export interface CompanyAnalyticsResponse {
  success: boolean;
  data: CompanyAnalyticsData;
}

export interface SidebarResponse {
  success: boolean;
  data: SidebarData;
}

export interface CompanySidebarResponse {
  success: boolean;
  data: CompanySidebarData;
}

// Worker Sidebar Types
export interface WorkerEmployment {
  id: number;
  worker_id: number;
  employer_id: number;
  company_id: number;
  hiring_request_id: number;
  agreed_salary: string;
  subscription_fee: string;
  salary_deduction_percentage: string;
  status: string;
  start_date: string;
  end_date: string | null;
  duration_days: number | null;
  work_description: string | null;
  termination_reason: string | null;
  termination_details: string | null;
  otp_verified: boolean;
  otp_verified_at: string | null;
  service_card_generated: boolean;
  service_card_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkerProfile {
  id: number;
  user_id: number;
  company_id: number | null;
  registration_type: string;
  first_name: string;
  last_name: string;
  age: number;
  experience_level: string;
  languages_spoken: string[];
  has_insurance: boolean;
  insurance_provider: string | null;
  insurance_number: string | null;
  work_type_preferences: string[];
  preferred_districts: string[];
  preferred_sectors: string[];
  min_salary: string;
  max_salary: string;
  availability_status: string;
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
  current_employment: WorkerEmployment | null;
}

export interface WorkerDashboardUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  profile_photo: string | null;
}

export interface WorkerStatistics {
  total_employments: number;
  active_employment: boolean;
  average_rating: string;
  total_ratings: number;
  total_incidents: number;
  unresolved_incidents: number;
  nida_verified: boolean;
  has_insurance: boolean;
  availability_status: string;
  registration_type: string;
}

export interface WorkerDashboardData {
  user: WorkerDashboardUser;
  worker: WorkerProfile;
  statistics: WorkerStatistics;
  current_employment: WorkerEmployment | null;
}

export interface UpdateProfilePhotoResponse {
  success: boolean;
  message: string;
  data: {
    profile_photo: string;
  };
}

export interface WorkerSidebarData {
  user: WorkerDashboardUser;
  worker: WorkerProfile;
  statistics: WorkerStatistics;
  current_employment: WorkerEmployment | null;
}

export interface WorkerDashboardResponse {
  success: boolean;
  message: string;
  data: WorkerDashboardData;
}

export interface WorkerSidebarResponse {
  success: boolean;
  data: WorkerSidebarData;
}