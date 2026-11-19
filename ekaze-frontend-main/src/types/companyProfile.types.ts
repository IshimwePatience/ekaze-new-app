export interface CompanyOwner {
  name: string;
  phone: string;
  email: string;
  gender: string;
}

export interface CompanyLocation {
  district: string | null;
  sector: string | null;
  cell: string | null;
  village: string | null;
}

export interface CompanyStats {
  total_workers: number;
  active_workers: number;
  available_workers: number;
  pending_requests: number;
  active_employments: number;
  total_incidents: number;
  completed_contracts: number;
  total_contracts: number;
  avg_worker_rating: number;
  active_employers: number;
  total_fees_collected: number;
}

export interface CompanyProfileUpdateRequest {
  business_name?: string;
  tin?: string;
  physical_address?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
}

export interface WorkerByCategory {
  category: string;
  count: number;
}

export interface RecentHire {
  name: string;
  role: string;
  employer: string;
  date: string;
  status: string;
}

export interface CompanyProfile {
  id: number;
  business_name: string;
  tin: string;
  physical_address: string;
  logo_url: string | null;
  status: string;
  approved_at: string | null;
  registered_at: string;
  subscription_fee: string;
  salary_deduction_percentage: string;
  total_revenue: string;
  owner: CompanyOwner;
  location: CompanyLocation;
  stats: CompanyStats;
  workers_by_category: WorkerByCategory[];
  recent_hires: RecentHire[];
}

export interface CompanyProfileResponse {
  success: boolean;
  data: CompanyProfile;
  message?: string;
}