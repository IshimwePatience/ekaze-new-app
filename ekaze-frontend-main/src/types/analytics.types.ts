export interface AnalyticsOverview {
  total_revenue: number;
  revenue_change: number;
  total_users: number;
  users_change: number;
  active_companies: number;
  companies_change: number;
  open_incidents: number;
  incidents_change: number;
}

export interface RevenueTrend {
  period: string;
  revenue: number;
  transaction_count: number;
}

export interface UserDistribution {
  name: string;
  value: number;
  color: string;
}

export interface RegistrationTrend {
  period: string;
  employers: number;
  workers: number;
  companies: number;
}

export interface IncidentTracking {
  period: string;
  incidents: number;
  resolved: number;
}

export interface TopCompany {
  id: number;
  name: string;
  workers: number;
  revenue: number;
}

export interface EmploymentStats {
  total_employments: number;
  active_employments: number;
  completed_employments: number;
  terminated_employments: number;
  new_employments: number;
  average_duration: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  total: number;
}

export interface PlatformAnalyticsData {
  overview: AnalyticsOverview;
  revenue_trends: RevenueTrend[];
  user_distribution: UserDistribution[];
  registration_trends: RegistrationTrend[];
  incident_tracking: IncidentTracking[];
  top_companies: TopCompany[];
  employment_stats: EmploymentStats;
  payment_methods: PaymentMethodBreakdown[];
}

export interface AnalyticsResponse {
  success: boolean;
  data: PlatformAnalyticsData;
}