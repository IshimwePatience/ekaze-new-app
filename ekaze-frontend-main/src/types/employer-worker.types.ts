export interface WorkerEmployment {
  id: number;
  worker_id: number;
  employer_id: number;
  started_at: string;
  ended_at: string | null;
  start_date: string;       // ← add
  end_date: string | null;  
  reason_of_ending: string | null;
  total_payment: number;
  created_at: string;
  updated_at: string;
  worker?: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    phone?: string;
    profile_photo?: string | null;
  };
}

export interface RateWorkerRequest {
  rating: number;
  review?: string;
  rating_categories?: {
    punctuality?: number;
    work_quality?: number;
    communication?: number;
    professionalism?: number;
  };
}

export interface RateWorkerResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    employment_id: number;
    worker_id: number;
    employer_id: number;
    reviewer_type: string;
    rating: number;
    review: string | null;
    rating_categories: Record<string, number> | null;
    is_visible: boolean;
    is_verified: boolean;
    verified_at: string;
  };
}


export interface WorkerRating {
  id: number;
  rating: number;
  review: string | null;
  rating_categories: {
    punctuality?: number;
    work_quality?: number;
    communication?: number;
    professionalism?: number;
  } | null;
  reviewer_name: string;
  created_at: string;
}

export interface WorkerRatingsResponse {
  success: boolean;
  data: WorkerRating[];
  pagination: { total: number; current_page: number; last_page: number };
}

// ==================== WORKER PAYMENTS ====================

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface WorkerPayment {
  id: number;
  worker_id: number;
  employer_id: number;
  worker_employment_id: number;
  start_time: string;
  end_date: string;
  paid_time: string | null;
  paid_amount: number;
  status: PaymentStatus;
  payment_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  worker?: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  employment?: WorkerEmployment;
}

export interface PaymentSummary {
  total_paid: number;
  total_pending: number;
  payment_count: number;
  next_payment_date: string | null;
}

// ==================== REQUESTS ====================

export interface CreatePaymentRequest {
  worker_employment_id: number;
  start_time: string;
  end_date: string;
  paid_amount: number;
  notes?: string;
}

export interface BulkCreatePaymentItem {
  worker_employment_id: number;
  start_time: string;
  end_date: string;
  paid_amount: number;
  notes?: string;
}

export interface BulkCreatePaymentRequest {
  payments: BulkCreatePaymentItem[];
}

export interface EndEmploymentRequest {
  reason_of_ending: string;
}

export interface BulkEndEmploymentRequest {
  employment_ids: number[];
  reason_of_ending: string;
}

// ==================== RESPONSES ====================

export interface WorkerPaymentsResponse {
  success: boolean;
  message: string;
  data: {
    data: WorkerPayment[];
    current_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface EmploymentPaymentsResponse {
  success: boolean;
  data: {
    employment: WorkerEmployment;
    payments: WorkerPayment[];
    summary: PaymentSummary;
  };
}

export interface CreatePaymentResponse {
  success: boolean;
  message: string;
  data: WorkerPayment;
}

export interface BulkPaymentResult {
  worker_employment_id: number;
  worker_name?: string;
  success: boolean;
  payment?: WorkerPayment;
  message?: string;
}

export interface BulkCreatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    success_count: number;
    fail_count: number;
    results: BulkPaymentResult[];
  };
}

export interface EndEmploymentResponse {
  success: boolean;
  message: string;
  data: WorkerEmployment;
}

export interface BulkEndEmploymentResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    success_count: number;
    fail_count: number;
    results: Array<{
      employment_id: number;
      worker_name?: string;
      success: boolean;
      message?: string;
    }>;
  };
}
export interface EmployerHiringRequest {
  id: number;
  employer_id: number;
  worker_id: number;
  company_id: number | null;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message: string | null;
  proposed_salary: string | null;
  work_description: string | null;
  created_at: string;
  updated_at: string;
  worker?: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    profile_photo: string | null;
    age: number;
    experience_level: string;
    availability_status: string;
  };
  company?: {
    id: number;
    business_name: string;
    owner_name: string;
    owner_phone: string;
    owner_email: string;
  };
}

export interface CreateHiringRequestRequest {
  worker_id: number;
  message?: string;
  proposed_salary?: number;
  work_description?: string;
  pay_account: string;
  channel: 'momo' | 'card' | 'bank' | 'cash' | 'manual';
}

export interface ConfirmPaymentRequest {
  transaction_ref: string;
  payment_id: number;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  data: {
    request: EmployerHiringRequest;
    payment: {
      id: number;
      amount: string;
      currency: string;
      status: string;
      transaction_ref: string;
      paid_at: string;
    };
  };
}

export interface CreateHiringRequestResponse {
  success: boolean;
  message: string;
  data: {
    request: EmployerHiringRequest;
    payment: { id: number; amount: string; currency: string; channel: string };
    payment_required: {
      amount: number;
      currency: string;
      pay_account: string;
      channel: string;
      note: string;
    };
    company_contact: {
      name: string;
      phone: string;
      email: string;
    };
  };
}

export interface HiringRequestsResponse {
  success: boolean;
  data: {
    current_page: number;
    data: EmployerHiringRequest[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
      url: string | null;
      label: string;
      page: number | null;
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

export interface HiringRequestResponse {
  success: boolean;
  data: EmployerHiringRequest;
}

export interface CancelHiringRequestResponse {
  success: boolean;
  message: string;
}


