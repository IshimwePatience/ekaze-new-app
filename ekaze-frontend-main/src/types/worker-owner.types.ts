// Worker Dashboard Types
export interface WorkerProfile {
  id: number;
  user_id: number;
  company_id: number;
  registration_type: string;
  first_name: string;
  last_name: string;
  age: number;
  gender?: string;
  national_id?: string;
  phone: string;
  email: string;
  profile_photo: string | null;
  experience_level: 'beginner' | 'intermediate' | 'experienced' | 'expert';
  languages_spoken: string[];
  work_type_preferences: string[];
  preferred_districts: string[];
  preferred_sectors: string[];
  min_salary: number;
  max_salary: number;
  availability_status: 'available' | 'unavailable';
  has_insurance: boolean;
  insurance_provider: string | null;
  insurance_number: string | null;
  average_rating: number;
  total_ratings: number;
  total_employments: number;
  nida_verified: boolean;
  company: {
    name: string;
    phone: string;
  } | null;
}

export interface WorkerStatistics {
  total_employments: number;
  active_employment: boolean;
  average_rating: string; // API returns string
  total_ratings: number;
  total_incidents: number;
  unresolved_incidents: number;
  nida_verified: boolean;
  has_insurance: boolean;
  availability_status: string;
  registration_type: string;
  // Add computed fields with defaults
  active_employments?: number;
  completed_employments?: number;
  total_earnings?: number;
  total_hours?: number;
  this_month_earnings?: number;
  this_month_hours?: number;
}


export interface EmploymentItem {
  id: number;
  worker_id: number;
  employer_id: number;
  company_id: number;
  hiring_request_id: number;
  agreed_salary: string;
  subscription_fee: string;
  salary_deduction_percentage: string;
  status: 'active' | 'completed' | 'terminated';
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
  employer?: {
    id: number;
    user?: {
      name: string;
      phone: string;
    };
  };
  company?: {
    id: number;
    business_name: string;
  };
  worker?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface RatingItem {
  id: number;
  employment_id: number;
  worker_id: number;
  employer_id: number;
  reviewer_type: 'employer' | 'worker';
  rating: number;
  review: string | null;
  rating_categories: Record<string, number> | null;
  is_visible: boolean;
  is_verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
  employer?: {
    id: number;
    user?: {
      name: string;
    };
  };
  employment?: {
    id: number;
    work_description: string;
  };
}

// API Response Types
export interface WorkerDashboardResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      phone: string;
      role: string;
      gender?: string;
      national_id?: string;
    };
    worker: WorkerProfile;
    statistics: WorkerStatistics;
    current_employment: EmploymentItem | null;
  };
}

export interface WorkerProfileResponse {
  success: boolean;
  data: WorkerProfile;
}

export interface WorkerEmploymentsResponse {
  success: boolean;
  data: {
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
  };
}

export interface WorkerRatingsResponse {
  success: boolean;
  data: {
    average_rating: number;
    total_ratings: number;
    ratings: {
      current_page: number;
      data: RatingItem[];
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
    };
  };
}

export interface UpdateAvailabilityPayload {
  availability_status: 'available' | 'unavailable';
}

export interface UpdateAvailabilityResponse {
  success: boolean;
  message: string;
  data: {
    availability_status: string;
  };
}