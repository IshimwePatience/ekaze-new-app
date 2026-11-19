export type EmployerTabType = "overview" | "search" | "active" | "verify" | "request" | "incidents" | "payments" | "schedules" | "map" | "agents" | "profile" | "agentsTabs" | "calendar";


// Employer Interfaces
export interface EmployerUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  district: string;
  sector: string;
  profile_photo: string | null;
}

export interface EmployerItem {
  id: number;
  user_id: number;
  has_paid_registration: boolean;
  registration_paid_at: string | null;
  active_workers: number;
  total_workers_hired: number;
  total_payments_made: string;
  total_incidents_reported: number;
  created_at: string;
  updated_at: string;
  user?: EmployerUser;
  employments_count?: number;
  active_employments_count?: number;
}

export interface EmploymentItem {
  id: number;
  employer_id: number;
  worker_id: number;
  company_id: number;
  status: 'active' | 'completed' | 'terminated';
  start_date: string;
  end_date: string | null;
  agreed_salary: string;
  subscription_fee: string;
  salary_deduction_percentage: string;
  work_description: string;
  duration_days: number | null;
  end_reason: string | null;
  created_at: string;
  updated_at: string;
  employer?: EmployerItem;
  worker?: {
    id: number;
    first_name: string;
    last_name: string;
    age: number;
    experience_level: string;
    average_rating: string;
    total_ratings: number;
    user?: {
      phone: string;
      email: string;
      district: string;
      profile_photo: string | null;
    };
  };
  ratings?: Array<{
    id: number;
    rating: number;
    comment: string;
    created_at: string;
  }>;
}

export interface EmployerFilters {
  search?: string;
  district?: string;
  has_paid?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

export interface EmploymentFilters {
  status?: 'active' | 'completed' | 'terminated';
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

export interface EmployersListData {
  current_page: number;
  data: EmployerItem[];
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

export interface EmployersResponse {
  success: boolean;
  data: EmployersListData;
  summary?: {
    total: number;
    active_workers: number;
    total_employers: number;
  };
}

export interface EmploymentListData {
  current_page: number;
  data: EmploymentItem[];
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

export interface EmployerWorkersResponse {
  success: boolean;
  data: EmploymentListData;
  summary?: {
    total: number;
    active: number;
    completed: number;
  };
}

export interface EmployerDetailsResponse {
  success: boolean;
  data: {
    employer: EmployerItem;
    statistics: {
      total_hires: number;
      active_workers: number;
      completed_employments: number;
      total_spent: number;
      total_subscription: number;
      avg_employment_duration: number;
    };
  };
}

export interface EmploymentDetailsResponse {
  success: boolean;
  data: EmploymentItem;
}

export interface EmployerStatistics {
  total_employers: number;
  paid_employers: number;
  unpaid_employers: number;
  active_employments: number;
  total_revenue: number;
  employers_by_district: Array<{
    district: string;
    count: number;
  }>;
  top_employers: Array<{
    id: number;
    name: string;
    total_hires: number;
    active_workers: number;
    has_paid: boolean;
    fee?: number;
  }>;
}

export interface EmployerStatisticsResponse {
  success: boolean;
  data: EmployerStatistics;
}

export interface UpdateEmploymentPayload {
  agreed_salary?: number;
  subscription_fee?: number;
  salary_deduction_percentage?: number;
  work_description?: string;
  status?: 'active' | 'completed' | 'terminated';
  end_date?: string;
  end_reason?: string;
}

export interface UpdateEmploymentResponse {
  success: boolean;
  message: string;
  data: EmploymentItem;
}