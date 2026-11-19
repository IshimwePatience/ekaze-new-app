export interface Setting {
  key: string;
  value: string | number | boolean;
  category: string;
  description?: string;
  is_active: boolean;
}

export interface SettingsGroup {
  [key: string]: {
    value: string | number | boolean;
    description?: string;
    is_active: boolean;
  };
}

export interface SettingsResponse {
  [category: string]: SettingsGroup;
}

export interface PaymentSettings {
  company_registration_fee: number;
  worker_registration_fee: number;
  employer_registration_fee: number;
  company_payment_enabled: boolean;
  worker_payment_enabled: boolean;
  employer_payment_enabled: boolean;
}

export interface ApiSettings {
  momo_api?: {
    [key: string]: {
      value: string;
      is_active: boolean;
    };
  };
  nida_api?: {
    [key: string]: {
      value: string;
      is_active: boolean;
    };
  };
  sms_api?: {
    [key: string]: {
      value: string;
      is_active: boolean;
    };
  };
}

export interface UpdateSettingRequest {
  value: string | number | boolean;
  description?: string;
}

export interface UpdatePaymentSettingsRequest {
  company_registration_fee?: number;
  worker_registration_fee?: number;
  employer_registration_fee?: number;
  company_payment_enabled?: boolean;
  worker_payment_enabled?: boolean;
  employer_payment_enabled?: boolean;
}

export interface UpdateApiSettingsRequest {
  [key: string]: string | number | boolean;
}

export interface UserProfile {
  id: number;
  role: string;
  name: string;
  email: string;
  phone?: string;
  national_id?: string;
  gender?: string;
  date_of_birth?: string;
  profile_photo?: string;
  profile_photo_url?: string;
  status: string;
  is_verified: boolean;
  verified_at?: string;
  address?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}

export interface UpdatePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}