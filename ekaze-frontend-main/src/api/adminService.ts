import api from '@/lib/api';

// Statistics Interfaces
export interface UserStatistics {
  total: number;
  supervisors: number;
  admins: number;
  companies: number;
  employers: number;
  workers: number;
  police: number;
  active: number;
  pending: number;
  suspended: number;
}


// Define the Company type
export interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationNumber: string;
  status: "pending" | "verified" | "rejected";
  address?: string;
  industry?: string;
  submittedAt?: string;
  documents?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
}

export interface CompanyStatistics {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  active_today: number;
}

export interface WorkerStatistics {
  total: number;
  freelance: number;
  company_registered: number;
  available: number;
  employed: number;
  unavailable: number;
  nida_verified: number;
  with_insurance: number;
}

export interface EmployerStatistics {
  total: number;
  paid: number;
  unpaid: number;
  active_hirers: number;
}

export interface EmploymentStatistics {
  total: number;
  active: number;
  completed: number;
  average_duration_days: number | null;
}

export interface TransactionStatistics {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  total_revenue: string | number;
  registration_revenue?: string | number;
  freelance_contact_revenue?: string | number;
  today_revenue: number;
  this_month_revenue: string;
}

export interface IncidentStatistics {
  total: number;
  open: number;
  under_investigation: number;
  resolved: number;
  closed: number;
  critical: number;
  reported_today: number;
}

export interface SystemUsageStatistics {
  total_users: number;
  active_percentage: number;
  pending_percentage: number;
  suspended_percentage: number;
  workers_percentage: number;
  employers_percentage: number;
  companies_percentage: number;
  officers_percentage: number;
  admins_percentage: number;
  worker_nida_verified_percentage: number;
  worker_insured_percentage: number;
  worker_employed_percentage: number;
  financial_registration_share: number;
  financial_freelance_share: number;
  incident_resolution_rate: number;
}

export interface Statistics {
  users: UserStatistics;
  companies: CompanyStatistics;
  workers: WorkerStatistics;
  employers: EmployerStatistics;
  employments: EmploymentStatistics;
  transactions: TransactionStatistics;
  incidents: IncidentStatistics;
  system_usage?: SystemUsageStatistics;
}

// Recent Activities Interfaces
export interface RecentCompany {
  id: number;
  business_name: string;
  status: string;
  registered_at: string;
}

export interface RecentWorker {
  id: number;
  name: string;
  type: string;
  status: string;
  registered_at: string;
}

export interface RecentTransaction {
  id: string;
  type: string;
  amount: string;
  status: string;
  created_at: string;
}

export interface RecentIncident {
  id: number | null;
  type: string;
  severity: string;
  status: string;
  reported_at: string;
}

export interface RecentActivities {
  recent_companies: RecentCompany[];
  recent_workers: RecentWorker[];
  recent_transactions: RecentTransaction[];
  recent_incidents: RecentIncident[];
}

export interface WorkerByDistrict {
  district: string;
  count: number;
}

export interface RevenueBreakdown {
  [key: string]: string;
}

// Main Dashboard Response Interface
export interface AdminDashboardData {
  statistics: Statistics;
  recent_activities: RecentActivities;
  revenue_breakdown: RevenueBreakdown;
  workers_by_district: WorkerByDistrict[];
}

export interface AdminDashboardResponse {
  success: boolean;
  data: AdminDashboardData;
  timestamp: string;
}

// Admin API Service
export const adminApi = {
  // Get admin dashboard data
  getDashboard: async (): Promise<AdminDashboardResponse> => {
    const response = await api.get<AdminDashboardResponse>('/admin/dashboard');
    return response.data;
  },
};