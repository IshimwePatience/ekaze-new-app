export type SupervisorTabType = "overview" | "incidents" | "workforce" | "profile";


export interface SupervisorStatistics {
  users: {
    total: number;
    active: number;
    inactive: number;
    new_this_month: number;
  };
  sessions: {
    active: number;
    yesterday: number;
    change: number;
  };
  revenue: {
    total: number;
    this_month: number;
    formatted_total: string;
    formatted_month: string;
  };
  system_health: {
    percentage: number;
    last_week: number;
    change: number;
  };
  workers: number;
  employers: number;
  companies: number;
  police: number;
}

export interface UserBreakdownItem {
  type: string;
  count: number;
  status: string;
  percentage: number;
}

export interface RecentActivityItem {
  user: string;
  type: string;
  action: string;
  time: string;
  timestamp: string;
}

export interface SystemHealth {
  uptime_percentage: number;
  active_users_24h: number;
  total_requests_24h: number;
  error_rate: number;
  avg_response_time: number;
}

export interface UserGrowthItem {
  date: string;
  count: number;
}

export interface SupervisorDashboardData {
  statistics: SupervisorStatistics;
  user_breakdown: UserBreakdownItem[];
  recent_activity: RecentActivityItem[];
  system_health: SystemHealth;
  user_growth: UserGrowthItem[];
}

export interface SupervisorDashboardResponse {
  success: boolean;
  data: SupervisorDashboardData;
  filters?: SupervisorDashboardFilters;
  timestamp: string;
}

// Analytics Types
export interface DailyUserStats {
  [date: string]: {
    date: string;
    role: string;
    count: number;
  }[];
}

export interface SupervisorDashboardFilters {
  period: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom';
  from_date?: string;
  to_date?: string;
  user_type?: 'worker' | 'employer' | 'company' | 'police' | null;
}

export interface MonthlyRevenueItem {
  year: number;
  month: number;
  total: number;
}

export interface UserEngagement {
  active_users: number;
  inactive_users: number;
  avg_session_duration: number;
  daily_active_users: number;
}

export interface PlatformMetrics {
  total_employments: number;
  active_employments: number;
  total_incidents: number;
  open_incidents: number;
  total_transactions: number;
  successful_transactions: number;
}

export interface SupervisorAnalyticsData {
  daily_users: DailyUserStats;
  monthly_revenue: MonthlyRevenueItem[];
  user_engagement: UserEngagement;
  platform_metrics: PlatformMetrics;
}

export interface SupervisorAnalyticsResponse {
  success: boolean;
  data: SupervisorAnalyticsData;
}