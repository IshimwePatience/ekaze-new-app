export type UserRole = 'admin' | 'employer' | 'worker' | 'company' | 'supervisor';

export interface UserAddress {
  district: string;
  sector: string;
  cell: string | null;
  village: string | null;
  full_address: string;
}

export interface UserProfile {
  id: number;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  national_id: string;
  gender: 'male' | 'female';
  date_of_birth: string | null;
  age: number | null;
  profile_photo: string | null;
  status: string;
  is_verified: boolean;
  address: UserAddress;
  created_at: string;
  employer?: {
    id: number;
    has_paid_registration: boolean;
    active_workers: number;
    total_workers_hired: number;
  };
  worker?: {
    id: number;
    registration_type: string;
    company_id: number | null;
    experience_level: string;
    availability_status: string;
    average_rating: string;
    total_ratings: number;
    total_employments: number;
    nida_verified: boolean;
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

// Worker Registration
export interface WorkerRegistrationRequest {
  // Document type — determines which ID field is used
  registration_document_type: 'nida' | 'passport';

  // NIDA path only
  national_id?: string;

  // Passport path only
  passport_number?: string;
  passport_expiry_date?: string;
  country_id?: number;

  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  gender: 'male' | 'female' | '';
  date_of_birth: string;
  photo?: File | null;
  experience_level: 'beginner' | 'intermediate' | 'expert' | '';
  professions?: string[];
  skills?: string[];
  languages_spoken: string[];
  work_type_preferences: string[];
  preferred_districts: string[];
  min_salary: number;
  max_salary: number;
  has_insurance?: number;
  insurance_type?: string;
  insurance_provider?: string;
  insurance_number?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}

export interface WorkerRegistrationData {
  user_id: number;
  worker_id: number;
  email: string;
  phone: string;
  otp_verified: boolean;
  otp_resends_remaining: number;
  otp_code?: string;
  otp_expires_in?: string;
}

// Employer Registration
export interface EmployerRegistrationRequest {
  name: string;
  phone: string;
  email?: string;
  national_id: string;
  password?: string;
  password_confirmation?: string;
  gender: 'male' | 'female' | '';
  province?: string;
  district: string;
  sector: string;
  cell?: string;
  village?: string;
  disclaimer_accepted: boolean; // NEW — required by backend
  photo?: File;
  profile_photo?: File | string;
}

export interface EmployerRegistrationData {
  user_id: number;
  employer_id: number;
  email: string;
  phone: string;
  otp_verified: boolean;
  otp_resends_remaining: number;
  payment_required: boolean;
  amount: number;
  transaction_id: string;
  otp_code?: string;
  otp_expires_in?: string;
}

// Company Registration
export interface CompanyRegistrationRequest {
  business_name: string;
  tin: string;
  physical_address: string;
  province?: string;
  district: string;
  sector: string;
  cell?: string;
  village?: string;
  logo?: File;
  photo?: File;
  profile_photo?: File | string;
  owner_name: string;
  national_id: string;
  owner_phone: string;
  owner_email: string;
  password: string;
  password_confirmation: string;
}

export interface CompanyRegistrationData {
  user_id: number;
  company_id: number;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  otp_verified: boolean;
  otp_resends_remaining: number;
  payment_required?: boolean;
  amount?: number;
  otp_code?: string;
  otp_expires_in?: string;
}

export interface OtpVerificationRequest {
  phone: string;
  otp_code: string;
}

export interface OtpResendRequest {
  phone: string;
}

export interface OtpVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: number;
    otp_verified: boolean;
    status: string;
    token?: string;
    token_type?: string;
    user?: UserProfile;
  };
}

export interface OtpResendResponse {
  success: boolean;
  message: string;
  data?: {
    phone: string;
    otp_resends_remaining: number;
    expires_in: string;
    otp_code?: string;
  };
}

export interface RegistrationResponse<T = WorkerRegistrationData | EmployerRegistrationData | CompanyRegistrationData> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginRequest {
  login: string;
  password: string;
  device_name?: string;
}

export interface LoginResponseData {
  token: string;
  token_type: string;
  expires_in: string;
  user: UserProfile;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserProfile;
  data?: LoginResponseData;
  requires_mfa?: boolean;
  mfa_method?: 'authenticator' | 'sms' | 'email';
  temp_token?: string;
}