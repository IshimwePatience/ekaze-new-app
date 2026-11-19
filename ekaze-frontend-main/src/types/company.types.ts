// Company Interfaces
export interface CompanyUser {
  id: number;
  role: string;
  name: string;
  email: string;
  phone: string;
  national_id: string | null;
  gender: string | null;
  date_of_birth: string | null;
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


export interface CompanyListItem {
  id: number;
  name: string;
  logo: string | null;
  owner_name: string;
}
// Add these NEW types at the end of the file

export interface WorkerFilters {
  status?: string;
  registration_type?: string;
  company_id?: number;
  nida_verified?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  per_page?: number;
}

// Business Card Generation
export interface GenerateBusinessCardsPayload {
  worker_ids: number[];
}

export interface GenerateBusinessCardsResult {
  success: boolean;
  message: string;
  data: {
    pdf_url: string;
    cards_count: number;
    card_numbers: string[];
  };
}

export interface NewWorkerRegistrationPayload {
  national_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  photo: File | null;
  experience_level: 'beginner' | 'intermediate' | 'expert';
  languages_spoken: string[];
  has_insurance: boolean;
  insurance_provider?: string;
  insurance_number?: string;
  work_type_preferences: string[];
  preferred_districts: string[];
  preferred_sectors?: string[];
  min_salary?: string;
  max_salary?: string;
  district: string;
  sector: string;
  cell?: string;
  village?: string;
  province?: string;
  address?: string;
  registration_mode?: 'quick' | 'full';
  marital_status?: string;
  experience_years?: string | number;
  education_level?: string;
  bio?: string;
  special_skills?: string;
  work_type?: string;
  available_from?: string;
  available_to?: string;
  available_weekends?: boolean;
  available_holidays?: boolean;
  has_driving_licence?: boolean;
  password?: string;
  passport_number?: string;
  registration_document_type?: string;
  insurance_type?: string;
  referee_name?: string;
  referee_phone?: string;
  referee_relationship?: string;
  referee_1_name?: string;
  referee_1_phone?: string;
  referee_1_relationship?: string;
  referee_2_name?: string;
  referee_2_phone?: string;
  referee_2_relationship?: string;
}

export interface PaymentPendingResponse {
  success: true;
  message: string;
  payment_required: true;
  data: {
    transaction_id: string;
    amount: number;
    worker_details: {
      first_name: string;
      last_name: string;
      national_id: string;
    };
  };
}

export interface DirectWorkerCreationResponse {
  success: true;
  message: string;
  payment_required?: false;
  data: Worker;
}

export type NewWorkerRegistrationResult = PaymentPendingResponse | DirectWorkerCreationResponse;

export interface FinalizeWorkerRegistrationPayload {
  transaction_id: string;
}

export interface FinalizeWorkerRegistrationResult {
  success: boolean;
  message: string;
  data: Worker;
}

export type TabType = "overview" | "workers" | "requests" | "employers" | "incidents" | "revenue" | "profile" | "settings";

export interface WorkerUser {
  id: number;
  role: string;
  name: string;
  email: string;
  phone: string;
  national_id: string | null;
  gender: string | null;
  date_of_birth: string | null;
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

export interface Employment {
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
  employer?: Employer;
}

export interface Worker {
  id: number;
  user_id: number;
  company_id: number;
  registration_type: string;
  first_name: string;
  last_name: string;
  age: number;
  experience_level: string;
  languages_spoken: string[];
  has_insurance: boolean;
  insurance_provider: string;
  insurance_number: string;
  work_type_preferences: string[];
  preferred_districts: string[];
  preferred_sectors: string[];
  min_salary: string;
  max_salary: string;
  availability_status: string;
  referee_1_name: string;
  referee_1_phone: string;
  referee_1_relationship: string;
  referee_2_name: string;
  referee_2_phone: string;
  referee_2_relationship: string;
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
  user?: WorkerUser;
  current_employment?: Employment | null;
}

export interface EmployerUser {
  id: number;
  role: string;
  name: string;
  email: string;
  phone: string;
  national_id: string;
  gender: string;
  date_of_birth: string | null;
  profile_photo: string | null;
  status: string;
  is_verified: boolean;
  verified_at: string | null;
  address: string | null;
  district: string;
  sector: string;
  cell: string;
  village: string;
  email_verified_at: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Employer {
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
  deleted_at: string | null;
  user?: EmployerUser;
}

export interface HiringRequest {
  id: number;
  employer_id: number;
  worker_id: number;
  company_id: number;
  status: string;
  message: string;
  proposed_salary: string;
  work_description: string;
  responded_at: string | null;
  response_message: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  employer?: Employer;
  worker?: Worker;
}

export interface Transaction {
  id: number;
  transaction_id: string;
  user_id: number;
  transaction_type: string;
  amount: string;
  payment_method: string;
  payment_phone: string | null;
  payment_reference: string | null;
  status: string;
  description: string;
  related_company_id: number | null;
  related_worker_id: number | null;
  related_employer_id: number | null;
  receipt_url: string | null;
  paid_at: string | null;
  failure_reason: string | null;
  metadata: Record<string, unknown>;
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
  status: "pending" | "approved" | "rejected" | "suspended";
  approved_at: string | null;
  approved_by: number | null;
  rejection_reason: string | null;
  suspension_reason?: string | null;
  subscription_fee: string;
  salary_deduction_percentage: string;
  total_workers: number;
  active_workers: number;
  total_revenue: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  workers_count?: number;
  active_workers_count?: number;
  hiring_requests_count?: number;
  user?: CompanyUser;
  workers?: Worker[];
  hiring_requests?: HiringRequest[];
  transactions?: Transaction[];
}

export interface CompanyStatistics {
  total_workers: number;
  active_workers: number;
  total_revenue: string;
  pending_requests: number;
  average_worker_rating: string;
}

export interface CompanyDetailsData {
  company: Company;
  statistics: CompanyStatistics;
}

export interface CompaniesListData {
  current_page: number;
  data: Company[];
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

export interface CompaniesResponse {
  success: boolean;
  data: CompaniesListData;
}

export interface CompanyDetailsResponse {
  success: boolean;
  data: CompanyDetailsData;
}

export interface CompanyActionRequest {
  rejection_reason?: string;
  suspension_reason?: string;
}

export interface CompanyActionResponse {
  success: boolean;
  message: string;
  data: Company;
}


export interface CompanyDashboardStatistics {
  workers: {
    total: number;
    available: number;
    hired: Worker[];
    unavailable: number;
  };
  hiring_requests: {
    pending: number;
    total: number;
  };
  employments: {
    active: number;
    total: number;
  };
  revenue: {
    total: string;
    registration_fees: string;
    subscriptions: string;
  };
  incidents: {
    total: number;
    unresolved: number;
  };
}

export interface CompanyDashboardData {
  company: Company;
  statistics: CompanyDashboardStatistics;
  recent_workers: Worker[];
  recent_hiring_requests: HiringRequest[];
  recent_transactions: Transaction[];
}

export interface CompanyDashboardResponse {
  success: boolean;
  data: CompanyDashboardData;
}

export interface WorkerGrowth {
  date: string;
  count: number;
}

export interface EmploymentStats {
  total: number;
  active: number;
  completed: number;
  average_duration: number | null;
}

export interface RevenueTrend {
  date: string;
  total: string;
}

export interface RatingDistribution {
  rating: string;
  count: number;
}

export interface IncidentTrend {
  date: string;
  count: number;
}

export interface CompanyAnalyticsData {
  worker_growth: WorkerGrowth[];
  employment_stats: EmploymentStats;
  revenue_trends: RevenueTrend[];
  rating_distribution: RatingDistribution[];
  incident_trends: IncidentTrend[];
}

export interface CompanyAnalyticsResponse {
  success: boolean;
  data: CompanyAnalyticsData;
}

// Worker Management Types
export interface WorkerListParams {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface WorkerSummary {
  total: number;
  available: number;
  hired: number;
}

export interface WorkersListResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Worker[];
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
  summary: WorkerSummary;
}

export interface WorkerStatistics {
  total_employments: number;
  active_employments: number;
  average_rating: string;
  total_ratings: number;
  total_incidents: number;
  total_earnings: string;
}

export interface Rating {
  id: number;
  rating: number;
  comment: string;
  reviewer: EmployerUser;
  created_at: string;
}

export interface Incident {
  id: number;
  type: string;
  description: string;
  status: string;
  created_at: string;
}

export interface WorkerDetailsData {
  worker: Worker;
  statistics: WorkerStatistics;
}

export interface WorkerDetailsResponse {
  success: boolean;
  data: WorkerDetailsData;
}

export interface WorkerRegistrationData {
  national_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
  gender: 'male' | 'female';
  date_of_birth: string;
  photo: File;
  experience_level: 'beginner' | 'intermediate' | 'expert';
  languages_spoken: string[];
  has_insurance: boolean;
  insurance_provider?: string;
  insurance_number?: string;
  work_type_preferences: string[];
  preferred_districts: string[];
  preferred_sectors?: string[];
  min_salary?: number;
  max_salary?: number;
  district: string;
  sector: string;
  cell?: string;
  village?: string;
  referee_1_name?: string;
  referee_1_phone?: string;
  referee_1_relationship?: string;
  referee_2_name?: string;
  referee_2_phone?: string;
  referee_2_relationship?: string;
}

export interface WorkerRegistrationResponse {
  success: boolean;
  message: string;
  payment_required?: boolean;
  data?: {
    transaction_id?: string;
    amount?: number;
    worker_details?: {
      first_name: string;
      last_name: string;
      national_id: string;
    };
  } | Worker;
}

export interface WorkerUpdateData {
  phone?: string;
  email?: string;
  photo?: File;
  experience_level?: 'beginner' | 'intermediate' | 'expert';
  languages_spoken?: string[];
  has_insurance?: boolean;
  insurance_provider?: string;
  insurance_number?: string;
  work_type_preferences?: string[];
  preferred_districts?: string[];
  preferred_sectors?: string[];
  min_salary?: number;
  max_salary?: number;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}

export interface WorkerActionResponse {
  success: boolean;
  message: string;
  data: Worker;
}

export interface EmploymentHistoryResponse {
  success: boolean;
  data: {
    current_page: number;
    data: Employment[];
    total: number;
  };
}