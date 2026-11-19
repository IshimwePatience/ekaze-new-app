// System Usage Types

export interface SystemMetric {
  value: number;
  status: 'excellent' | 'normal' | 'warning' | 'critical';
  formatted_value: string;
  days?: number;
}

export interface SystemMetrics {
  cpu_usage: SystemMetric;
  memory_usage: SystemMetric;
  disk_usage: SystemMetric;
  uptime: SystemMetric;
}

export interface HourlyTrafficItem {
  hour: string;
  requests: number;
  users: number;
}

export interface DailySystemLoadItem {
  day: string;
  date: string;
  cpu: number;
  memory: number;
  disk: number;
}

export interface ApiEndpointItem {
  endpoint: string;
  calls: number;
}

export interface SummaryStatItem {
  value: number;
  formatted: string;
  status?: 'excellent' | 'normal' | 'warning';
}

export interface SummaryStats {
  avg_response_time: SummaryStatItem;
  total_requests: SummaryStatItem;
  success_rate: SummaryStatItem;
}

export interface SystemUsageFilters {
  period: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom';
  from_date: string;
  to_date: string;
  company_id?: number | null;
  model_type?: string | null;
}

export interface SystemUsageData {
  system_metrics: SystemMetrics;
  hourly_traffic: HourlyTrafficItem[];
  daily_system_load: DailySystemLoadItem[];
  api_endpoints: ApiEndpointItem[];
  summary_stats: SummaryStats;
}

export interface SystemUsageResponse {
  success: boolean;
  data: SystemUsageData;
  filters: SystemUsageFilters;
  timestamp: string;
}

// Hourly Traffic Response
export interface HourlyTrafficResponse {
  success: boolean;
  data: HourlyTrafficItem[];
}

// System Load Response
export interface SystemLoadResponse {
  success: boolean;
  data: DailySystemLoadItem[];
}

// API Endpoints Response
export interface ApiEndpointsResponse {
  success: boolean;
  data: ApiEndpointItem[];
}