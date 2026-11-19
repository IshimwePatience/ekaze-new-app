export type NotificationType =
  | 'otp_verified'
  | 'account_verified'
  | 'account_activated'
  | 'account_suspended'
  | 'password_reset'
  | 'login_success'
  | 'company_registered'
  | 'employer_registered'
  | 'worker_registered'
  | 'company_approved'
  | 'company_rejected'
  | 'company_suspended'
  | 'worker_verified'
  | 'worker_hired'
  | 'worker_suspended'
  | 'worker_reactivated'
  | 'worker_rated'
  | 'hiring_request_received'
  | 'hiring_request_accepted'
  | 'hiring_request_rejected'
  | 'incident_reported'
  | 'incident_assigned'
  | 'incident_status_updated'
  | 'incident_resolved'
  | 'incident_notes_added'
  | 'payment_received'
  | 'payment_pending'
  | 'payment_failed'
  | 'system_announcement';

export type RecipientType = 'to' | 'cc';

// Notification data structure (replaces Record<string, any>)
export interface NotificationData {
  // Common fields
  action_url?: string;
  
  // User related
  user_id?: number;
  name?: string;
  phone?: string;
  verified_at?: string;
  next_step?: string;
  
  // Company related
  company_id?: number;
  business_name?: string;
  tin?: string;
  
  // Employer related
  employer_id?: number;
  
  // Worker related
  worker_id?: number;
  worker_name?: string;
  experience_level?: string;
  
  // Incident related
  incident_id?: number;
  incident_number?: string;
  severity?: string;
  incident_type?: string;
  description?: string;
  old_status?: string;
  new_status?: string;
  
  // Hiring request related
  hiring_request_id?: number;
  employer_name?: string;
  
  // Transaction/Payment related
  transaction_id?: string;
  amount?: number;
  payment_method?: string;
  transaction_type?: string;
  
  // Rating related
  rating?: number;
  review?: string;
  
  // Security related
  ip_address?: string;
  device?: string;
  timestamp?: string;
  reset_at?: string;
  reset_method?: string;
  
  // Employment related
  employment_id?: number;
  activated_at?: string;
  
  // System related
  priority?: 'low' | 'medium' | 'high';
  target_roles?: string[];
  broadcast_by?: string;
  contact_support?: boolean;
  
  // Suspension/Action related
  suspension_reason?: string;
  suspended_at?: string;
  reactivated_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  
  // Additional optional fields
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface NotificationCreator {
  id: number;
  name: string;
  email: string;
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData | null;
  reference_type: string | null;
  reference_id: number | null;
  channel: 'database' | 'sms' | 'email' | 'push';
  is_sent: boolean;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  creator: NotificationCreator | null;
  is_read: boolean;
  read_at: string | null;
  recipient_type: RecipientType;
}

export interface NotificationFilters {
  page?: number;
  per_page?: number;
  filter?: 'all' | 'read' | 'unread';
  type?: NotificationType;
}

export interface NotificationPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: NotificationItem[];
  pagination: NotificationPagination;
}

export interface NotificationDetailsResponse {
  success: boolean;
  message: string;
  data: NotificationItem;
}

export interface NotificationCountResponse {
  success: boolean;
  data: {
    unread_count: number;
  };
}

export interface NotificationStatistics {
  total: number;
  unread: number;
  read: number;
  by_type: Array<{
    type: NotificationType;
    count: number;
  }>;
}

export interface NotificationStatisticsResponse {
  success: boolean;
  message: string;
  data: NotificationStatistics;
}

export interface NotificationActionResponse {
  success: boolean;
  message: string;
}