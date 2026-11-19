// Worker Profile Types

export interface WorkerUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  national_id: string;
  district?: string;
  sector?: string;
  profile_photo?: string | null;
}

export interface WorkerCompany {
  name: string;
  phone: string;
}

export interface WorkerStatistics {
  total_employments: number;
  active_employments: number;
  completed_employments: number;
  average_rating: string;
  total_ratings: number;
  total_earnings: string;
  this_month_earnings: string;
}

export interface WorkerProfile {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  gender: string;
  national_id: string;
  phone: string;
  email: string;
  profile_photo: string | null;
  profile_photo_url?: string;
  experience_level: 'beginner' | 'intermediate' | 'experienced' | 'expert';
  languages_spoken: string[];
  work_type_preferences: string[];
  preferred_districts: string[];
  preferred_sectors: string[];
  min_salary: string | number;
  max_salary: string | number;
  availability_status: 'available' | 'unavailable' | 'hired';
  has_insurance: boolean;
  insurance_provider: string | null;
  insurance_number: string | null;
  average_rating: string;
  total_ratings: number;
  total_employments: number;
  nida_verified: boolean;
  company: WorkerCompany | null;
  registration_document_type?: 'nida' | 'passport';
  passport_number?: string | null;
  passport_expiry_date?: string | null;
  is_foreign_worker?: boolean;
  nationality?: string | null;
  country?: {
    id: number;
    name: string;
    continent: string | null;
    phone_code: string | null;
  } | null;
}

export interface WorkerDashboardData {
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  worker: WorkerProfile;
  statistics: WorkerStatistics;
  current_employment: Employment | null;
}

export interface Employment {
  id: number;
  employer_id: number;
  worker_id: number;
  company_id: number;
  status: 'active' | 'completed' | 'terminated' | 'suspended';
  agreed_salary: string;
  work_description: string;
  start_date: string;
  end_date: string | null;
  termination_reason: string | null;
  created_at: string;
  updated_at: string;
  employer?: {
    id: number;
    user_id: number;
    user?: {
      id: number;
      name: string;
      email: string;
      phone: string;
      district: string;
      sector: string;
    };
  };
  company?: {
    id: number;
    business_name: string;
    owner_phone: string;
  };
}

export interface Rating {
  id: number;
  worker_id: number;
  employer_id: number;
  employment_id: number;
  rating: number;
  review: string;
  reviewer_type: 'employer' | 'worker';
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  employer?: {
    id: number;
    user?: {
      id: number;
      name: string;
      email: string;
    };
  };
  employment?: {
    id: number;
    work_description: string;
    start_date: string;
    end_date: string;
  };
}

// Request/Update Interfaces
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  age?: number;
  experience_level?: 'beginner' | 'intermediate' | 'experienced' | 'expert';
  languages_spoken?: string[];
  work_type_preferences?: string[];
  preferred_districts?: string[];
  preferred_sectors?: string[];
  min_salary?: number;
  max_salary?: number;
  has_insurance?: boolean;
  insurance_provider?: string;
  insurance_number?: string;
  profile_photo?: File;
}

export interface UpdateAvailabilityRequest {
  availability_status: 'available' | 'unavailable';
}

// Response Interfaces
export interface WorkerDashboardResponse {
  success: boolean;
  message: string;
  data: WorkerDashboardData;
}

export interface WorkerProfileResponse {
  success: boolean;
  data: WorkerProfile;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: WorkerProfile;
}

export interface EmploymentsListData {
  current_page: number;
  data: Employment[];
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

export interface EmploymentsResponse {
  success: boolean;
  data: EmploymentsListData;
}

export interface RatingsListData {
  current_page: number;
  data: Rating[];
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

export interface RatingsResponse {
  success: boolean;
  data: {
    average_rating: string;
    total_ratings: number;
    ratings: RatingsListData;
  };
}

export interface UpdateAvailabilityResponse {
  success: boolean;
  message: string;
  data: {
    availability_status: 'available' | 'unavailable';
  };
}

// Filter Interfaces
export interface EmploymentFilters {
  status?: 'active' | 'completed' | 'terminated' | 'suspended';
  page?: number;
}

export interface RatingFilters {
  page?: number;
}