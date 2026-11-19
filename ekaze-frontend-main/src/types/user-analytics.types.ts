// User Analytics Types

export interface UserGrowthDataItem {
  month: string;
  workers: number;
  employers: number;
  companies: number;
  police: number;
  total: number;
}

export interface UserTypeDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface DailyActiveUserItem {
  day: string;
  date: string;
  users: number;
}

export interface EngagementMetric {
  value: number;
  change: number;
  formatted_change: string;
}

export interface SessionMetric {
  value: number;
  change: number;
  formatted_value: string;
  formatted_change: string;
}

export interface VerificationMetric {
  value: number;
  percentage: number;
  formatted_percentage: string;
}

export interface EngagementMetrics {
  active_users: EngagementMetric;
  new_registrations: EngagementMetric;
  avg_session_time: SessionMetric;
  verified_accounts: VerificationMetric;
}

export interface DetailedBreakdownItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface UserAnalyticsData {
  user_growth: UserGrowthDataItem[];
  user_type_distribution: UserTypeDistributionItem[];
  daily_active_users: DailyActiveUserItem[];
  engagement_metrics: EngagementMetrics;
  detailed_breakdown: DetailedBreakdownItem[];
}

export interface UserAnalyticsFilters {
  period: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom';
  from_date?: string;
  to_date?: string;
  start_date?: string;
  end_date?: string;
}

export interface UserAnalyticsResponse {
  success: boolean;
  data: UserAnalyticsData;
  filters?: UserAnalyticsFilters;
  timestamp: string;
}

// Growth Trends Response
export interface GrowthTrendsResponse {
  success: boolean;
  data: UserGrowthDataItem[];
  filters?: UserAnalyticsFilters;
}

// Daily Active Response
export interface DailyActiveResponse {
  success: boolean;
  data: DailyActiveUserItem[];
  filters?: UserAnalyticsFilters;
}

// Export Response
export interface ExportAnalyticsResponse {
  success: boolean;
  data: {
    user_growth: UserGrowthDataItem[];
    user_type_distribution: UserTypeDistributionItem[];
    daily_active_users: DailyActiveUserItem[];
    engagement_metrics: EngagementMetrics;
    filters?: UserAnalyticsFilters;
    exported_at: string;
  };
}