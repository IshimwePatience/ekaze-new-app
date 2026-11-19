
export interface EmployerDashboardFilters {
  period?: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom' | 'all_time';
  from_date?: string;
  to_date?: string;
  worker_status?: 'active' | 'terminated' | 'completed' | 'all';
  incident_severity?: 'critical' | 'high' | 'medium' | 'low' | 'all';
  payment_status?: 'pending' | 'completed' | 'failed' | 'all';
  hiring_status?: 'pending' | 'accepted' | 'rejected' | 'all';
  sort_by?: 'recent' | 'oldest' | 'name' | 'amount';
}

export interface EmployerDashboardResponse {
  success: boolean;
  message: string;
  data: EmployerDashboardData;
  timestamp: string;
}

// Add these interfaces for export if needed
export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf';
  include_charts?: boolean;
  include_details?: boolean;
}

export interface EmployerWorkerStatistics {
  active: number;
  total_hired: number;
  available: number;
  terminated: number;
}

export interface EmployerTransactionStatistics {
  total_spent: string;
  this_month_spent: string;
  last_month_spent: string;
  today_spent: string;
  pending_payments: number;
  completed_payments: number;
}

export interface EmployerIncidentStatistics {
  total: number;
  open: number;
  resolved: number;
  critical: number;
}

export interface EmployerHiringRequestStatistics {
  pending: number;
  accepted: number;
  rejected: number;
  total: number;
}

export interface EmployerEmploymentStatistics {
  active: number;
  completed: number;
  average_duration_days: number;
  success_rate: number;
}

export interface EmployerStatistics {
  workers: EmployerWorkerStatistics;
  transactions: EmployerTransactionStatistics;
  incidents: EmployerIncidentStatistics;
  hiring_requests: EmployerHiringRequestStatistics;
  employments: EmployerEmploymentStatistics;
}

export interface RecentWorker {
  id: number;
  name: string;
  type: string;
  status: string;
  hired_at: string;
  duration: string;
}

export interface RecentPayment {
  id: string;
  worker: string;
  amount: string;
  type: string;
  status: string;
  date: string;
}

export interface RecentIncident {
  id: string;
  worker: string;
  type: string;
  severity: string;
  status: string;
  reported_at: string;
}

export interface RecentHiringRequest {
  id: number;
  worker: string;
  company: string;
  status: string;
  requested_at: string;
}

export interface UpcomingPayment {
  id: string;
  worker: string;
  amount: string;
  due_date: string;
  status: string;
  days_until_due: number;
}

export interface RecentActivities {
  recent_workers: RecentWorker[];
  recent_payments: RecentPayment[];
  recent_incidents: RecentIncident[];
  recent_hiring_requests: RecentHiringRequest[];
  upcoming_payments: UpcomingPayment[];
}

export interface EmploymentByStatus {
  status: string;
  count: number;
}

export interface MonthlySpending {
  month: string;
  amount: string;
}

export interface EmployerDashboardData {
  statistics: EmployerStatistics;
  recent_activities: RecentActivities;
  employments_by_status: EmploymentByStatus[];
  monthly_spending: MonthlySpending[];
}

export interface EmployerDashboardResponse {
  success: boolean;
  message: string;
  data: EmployerDashboardData;
  timestamp: string;
}