export interface HiringRequestFilters {
  status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'all';
  from_date?: string;
  to_date?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface HiringRequest {
  id: number;
  employer_id: number;
  worker_id: number;
  company_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message: string | null;
  proposed_salary: number | string | null;
  work_description: string | null;
  response_message: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  worker: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    age: number;
    gender: string;
    experience_level: string;
    average_rating: number | string;
    availability_status: string;
    profile_photo: string | null;
  };
  company: {
    id: number;
    business_name: string;
    owner_name: string;
    owner_phone: string;
    owner_email: string;
  };
  employment?: {
    id: number;
    start_date: string;
    agreed_salary: number | string;
    status: string;
  } | null;
}

export interface HiringRequestFormData {
  worker_id: number;
  message?: string;
  proposed_salary?: number;
  work_description?: string;
}

export interface HiringRequestListResponse {
  success: boolean;
  data: {
    data: HiringRequest[];
    current_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}