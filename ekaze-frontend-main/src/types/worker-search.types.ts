export interface WorkerSearchFilters {
  gender?: 'male' | 'female' | 'all';
  min_age?: number;
  max_age?: number;
  district?: string;
  sector?: string;
  min_salary?: number;
  max_salary?: number;
  experience_level?: 'beginner' | 'intermediate' | 'expert' | 'all';
  has_insurance?: boolean | 'all';
  languages?: string[];
  period?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom' | 'all_time';
  from_date?: string;
  to_date?: string;
  sort_by?: 'recent' | 'oldest' | 'name' | 'rating' | 'salary_high' | 'salary_low';
  availability?: 'available' | 'hired' | 'all';
  rating_min?: number;
  rating_max?: number;
  search?: string;
  page?: number;
  per_page?: number;
  // Add company filter
  company_id?: number;
  registration_type?: 'company' | 'freelance' | 'all';
}

export interface WorkerPublic {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  age: number;
  gender: string;
  experience_level: string;
  languages_spoken: string[];
  has_insurance: boolean;
  work_type_preferences: string[];
  preferred_districts: string[];
  preferred_sectors: string[];
  min_salary: number | string;
  max_salary: number | string;
  availability_status: string;
  district: string;
  sector: string;
  profile_photo: string | null;
  average_rating: number;
  total_ratings: number;
  created_at: string;
  contact_visible: boolean;
  payment_required_message: string;
  // Optional company info
  company_id?: number;
  company_name?: string;
}

export interface WorkerPaid {
  id: number;
  first_name: string;
  last_name: string;
  full_name?: string;
  age: number;
  gender: string;
  experience_level: string;
  languages_spoken: string[];
  has_insurance: boolean;
  insurance_provider?: string | null;
  insurance_number?: string | null;
  work_type_preferences: string[];
  preferred_districts: string[];
  preferred_sectors: string[] | null;
  min_salary: number;
  max_salary: number;
  fee: number;
  availability_status: string;
  district: string | null;
  sector: string | null;
  cell?: string | null;
  village?: string | null;
  profile_photo: string | null;
  average_rating: number;
  total_ratings: number;
  
  // Additional fields for authenticated users
  email?: string | null;
  phone?: string | null;
  national_id?: string | null;
  date_of_birth?: string | null;
  registration_type?: 'company' | 'freelance';
  nida_verified?: boolean;
  nida_verified_at?: string | null;
  referee_1_name?: string | null;
  referee_1_phone?: string | null;
  referee_1_relationship?: string | null;
  referee_2_name?: string | null;
  referee_2_phone?: string | null;
  referee_2_relationship?: string | null;
  
  // Company info
  company_id?: number | null;
  company?: {
    id: number;
    business_name: string;
    owner_name?: string;
    owner_phone?: string;
    owner_email?: string;
    logo?: string | null;
  } | null;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
  
  // Additional stats
  total_employments?: number;
  total_incidents?: number;
}

export interface WorkerSearchResponse {
  success: boolean;
  message: string;
  data: {
    data: (WorkerPublic | WorkerPaid)[];
    current_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
  };
  payment_required?: boolean;
  note?: string;
}

export interface WorkerDetailsResponse {
  success: boolean;
  message?: string;
  data: {
    worker: WorkerPaid;
  } | WorkerPaid;
}