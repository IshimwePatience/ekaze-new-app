// Hiring Request Interfaces
export interface HiringRequestWorker {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  experience_level: string;
  average_rating: string;
  total_ratings: number;
  availability_status: string;
  work_type_preferences: string[];
  user?: {
    phone: string;
    email: string;
    district: string;
    sector: string;
    profile_photo: string | null;
  };
}



export interface HiringRequestEmployer {
  id: number;
  user_id: number;
  active_workers: number;
  total_workers_hired: number;
  user?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    district: string;
    sector: string;
  };
}

export interface HiringRequestItem {
  id: number;
  employer_id: number;
  worker_id: number;
  company_id: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message: string;
  proposed_salary: string;
  work_description: string;
  responded_at: string | null;
  response_message: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  employer?: HiringRequestEmployer;
  worker?: HiringRequestWorker;
  employment?: {
    id: number;
    status: string;
    agreed_salary: string;
  };
}

export interface HiringRequestFilters {
  status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'history';
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

export interface HiringRequestsListData {
  current_page: number;
  data: HiringRequestItem[];
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

export interface HiringRequestsResponse {
  success: boolean;
  data: HiringRequestsListData;
}

export interface HiringRequestDetailsResponse {
  success: boolean;
  data: HiringRequestItem;
}

export interface HiringRequestStatistics {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  response_rate: number;
  average_response_time: string;
}

export interface HiringRequestStatisticsResponse {
  success: boolean;
  data: HiringRequestStatistics;
}

export interface AcceptHiringRequestPayload {
  agreed_salary: number;
  subscription_fee?: number;
  salary_deduction_percentage?: number;
  work_description?: string;
  response_message?: string;
}

export interface RejectHiringRequestPayload {
  response_message: string;
}

export interface HiringRequestActionResponse {
  success: boolean;
  message: string;
  data: {
    hiring_request: HiringRequestItem;
    employment?: {
      id: number;
      status: string;
      agreed_salary: string;
    };
    otp_info?: {
      expires_in_minutes: number;
      worker_phone_preview: string;
    };
    next_step?: string;
  };
}




export interface PaymentRequiredResponse {
  success: false;
  message: string;
  payment_required: true;
  payment_amount: number;
  hiring_request_id: number;
}

export interface InitiatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment_id: number;
    amount: number;
    transaction_reference: string;
    currency: string;
  };
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment_status: string;
    transaction_reference: string;
    amount_paid: number;
  };
}