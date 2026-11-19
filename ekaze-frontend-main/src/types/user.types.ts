import type { Company } from './company.types';
import type { Worker } from './worker.types'; 
import type { Employer } from './company.types';

export interface User {
  id: number;
  role: 'admin' | 'supervisor' | 'company' | 'employer' | 'worker' | 'police';
  name: string;
  email: string;
  phone: string;
  national_id: string | null;
  gender: 'male' | 'female';
  date_of_birth: string | null;
  profile_photo: string | null;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  is_verified: boolean;
  verified_at: string | null;
  address: string | null;
  district: string | null;
  sector: string | null;
  cell: string | null;
  village: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  otp_blocked_until: string;
  otp_verified: boolean
  created_at: string;
  updated_at: string;
  
  // Relationships - replace 'any' with proper types
  company?: Company | null;
  worker?: Worker | null;
  employer?: Employer | null;
  transactions?: Transaction[];
  auditLogs?: AuditLog[];
  nidaVerifications?: NidaVerification[];
  assignedIncidents?: Incident[];
}



interface Transaction {
  id: number;
  transaction_id: string;
  user_id: number;
  amount: string;
  status: string;
  transaction_type: string;
  created_at: string;
}

interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  model_type: string;
  model_id: number;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface NidaVerification {
  id: number;
  user_id: number;
  status: string;
  created_at: string;
}

interface Incident {
  id: number;
  incident_number: string;
  status: string;
  created_at: string;
}

export interface UserStatistics {
  total: number;
  by_role: {
    admin: number;
    supervisor: number;
    company: number;
    employer: number;
    worker: number;
    police: number;
  };
  by_status: {
    active: number;
    pending: number;
    suspended: number;
    inactive: number;
  };
  verified: number;
  unverified: number;
  this_month: number;
  this_week: number;
  today: number;
}

export interface UserDetailsStatistics {
  total_transactions: number;
  total_audit_logs: number;
  // Company-specific
  total_workers?: number;
  active_workers?: number;
  total_hiring_requests?: number;
  pending_requests?: number;
  // Worker-specific
  total_employments?: number;
  completed_employments?: number;
  average_rating?: string;
  total_incidents?: number;
  // Employer-specific
  active_employments?: number;
  // Police-specific
  assigned_incidents?: number;
  resolved_incidents?: number;
  pending_incidents?: number;
}

export interface UsersResponse {
  success: boolean;
  data: {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface UserDetailsResponse {
  success: boolean;
  data: {
    user: User;
    statistics: UserDetailsStatistics;
  };
}

export interface UserStatisticsResponse {
  success: boolean;
  data: UserStatistics;
}

export interface CreateUserRequest {
  role: string;
  name: string;
  email: string;
  phone: string;
  national_id?: string;
  gender: string;
  date_of_birth?: string;
  password: string;
  password_confirmation: string;
  address?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  status?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  national_id?: string;
  gender?: string;
  date_of_birth?: string;
  address?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}

export interface SuspendUserRequest {
  reason: string;
}

export interface ResetPasswordRequest {
  new_password: string;
  new_password_confirmation: string;
}

export interface UserActionResponse {
  success: boolean;
  message: string;
  data?: User;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  model_type: string;
  model_id: number;
  details: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface UserActivityLogsParams {
  page?: number;
  per_page?: number;
  time_filter?: 'all' | 'today' | '7days' | '30days' | 'custom';
  from_date?: string;
  to_date?: string;
  type?: string;
}

export interface UserActivityDetailsResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      name: string;
      email?: string;
      phone?: string;
      role: string;
      status: string;
      profile_photo?: string;
      national_id?: string;
      district?: string;
    };
    registration: {
      registered_at: string;
      registration_method: string;
      ip_address: string;
      user_agent: string;
      is_verified: boolean;
      verified_at?: string;
    };
    security: {
      mfa_enabled: boolean;
      mfa_method: string;
      otp_verified: boolean;
      otp_blocked_until?: string | null;
      last_login_at?: string | null;
      last_login_ip?: string | null;
      password_updated_at?: string;
    };
    sessions_summary: {
      total_logins: number;
      active_sessions: number;
      recent_sessions: Array<{
        id: string;
        user_id: number;
        ip_address?: string;
        user_agent?: string;
        is_valid: boolean;
        expires_at: string;
        created_at: string;
      }>;
    };
    payments: Array<{
      id: number;
      reference_id: string;
      user_id: number;
      type: string;
      amount: number | string;
      fee: number | string;
      payment_method: string;
      phone_number?: string;
      status: 'pending' | 'successful' | 'failed' | 'under_review';
      metadata?: any;
      created_at: string;
    }>;
    navigation_logs: {
      data: Array<{
        id: number;
        user_id: number;
        action: string;
        module: string;
        ip_address: string;
        user_agent: string;
        details?: any;
        created_at: string;
      }>;
      total: number;
      current_page: number;
      last_page: number;
      per_page: number;
    };
  };
}

export interface ActivityLogsResponse {
  success: boolean;
  data: {
    data: ActivityLog[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ADD at end of file:
export interface PoliceJurisdiction {
  id: number;
  user_id: number;
  province_id: number;
  district_id: number | null;
  sector_id: number | null;
  cell_id: number | null;
  village_id: number | null;
  notes: string | null;
  coverage_level: 'province' | 'district' | 'sector' | 'cell' | 'village';
  coverage_summary: string;
  province?: { id: number; name: string };
  district?: { id: number; name: string };
  sector?: { id: number; name: string };
  cell?: { id: number; name: string };
  village?: { id: number; name: string };
  created_at: string;
  updated_at: string;
}

export interface JurisdictionResponse {
  success: boolean;
  message: string;
  data: PoliceJurisdiction;
}

export interface JurisdictionsListResponse {
  success: boolean;
  data: {
    officer: { id: number; name: string; email: string; phone: string; status: string };
    jurisdictions: PoliceJurisdiction[];
    total: number;
  };
}

export interface CreateJurisdictionRequest {
  user_id: number;
  province_id: number;
  district_id?: number | null;
  sector_id?: number | null;
  cell_id?: number | null;
  village_id?: number | null;
  notes?: string;
}