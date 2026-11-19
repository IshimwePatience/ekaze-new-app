export interface IncidentStatistic {
  value: number;
  change: number;
  formatted_change: string;
  trend: 'up' | 'down' | 'neutral';
}

export interface DashboardStatistics {
  total_incidents: IncidentStatistic;
  pending_review: IncidentStatistic;
  resolved: IncidentStatistic;
  critical_cases: IncidentStatistic;
  verified_workers: number;
  avg_response_time: string;
  resolution_rate: number;
  active_cases: number;
}

export interface IncidentTrendItem {
  month: string;
  total: number;
  assault: number;
  theft: number;
  dispute: number;
  misconduct: number;
  harassment: number;
  other: number;
}

export interface DailyIncidentItem {
  day: string;
  date: string;
  incidents: number;
}

export interface IncidentTypeDistribution {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface DistrictIncidentItem {
  district: string;
  incidents: number;
  percentage: number;
}

export interface ResolutionTimeItem {
  timeframe: string;
  cases: number;
  percentage: number;
}

export interface VerificationTrendItem {
  month: string;
  verified: number;
  pending: number;
}

export interface RecentIncident {
  id: string;
  incident_number: string;
  type: string;
  worker: {
    id: number;
    name: string;
    worker_id: string;
  };
  employer: {
    id: number;
    name: string;
  };
  household: string;
  location: string;
  status: 'reported' | 'under_investigation' | 'resolved' | 'dismissed' | 'escalated';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reported_date: string;
  reported_by: string;
  description: string;
  witnesses: number;
    geo?: {
    latitude: number;
    longitude: number;
    source: string;
    label: string;
  } | null;
}

export interface PoliceAnalyticsData {
  statistics: DashboardStatistics;
  incident_trends: IncidentTrendItem[];
  daily_incidents: DailyIncidentItem[];
  incident_type_distribution: IncidentTypeDistribution[];
  district_incidents: DistrictIncidentItem[];
  resolution_time_analysis: ResolutionTimeItem[];
  verification_trends: VerificationTrendItem[];
  recent_incidents: RecentIncident[];
}

export interface PoliceAnalyticsFilters {
  period: 'last_7_days' | 'last_30_days' | 'last_90_days' | 'this_month' | 'last_month' | 'custom';
  from_date?: string;
  to_date?: string;
  status?: 'all' | 'pending' | 'investigating' | 'resolved' | 'dismissed' | 'escalated';
  severity?: 'all' | 'low' | 'medium' | 'high' | 'critical';
  incident_type?: 'all' | 'assault' | 'theft' | 'dispute' | 'misconduct' | 'harassment' | 'contract_violation' | 'other';
  district?: string;
}

export interface PoliceAnalyticsResponse {
  success: boolean;
  data: PoliceAnalyticsData;
  filters?: PoliceAnalyticsFilters;
  timestamp: string;
}

// Incidents List Response
export interface IncidentsListResponse {
  success: boolean;
  data: {
    incidents: RecentIncident[];
    pagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    };
  };
  filters?: PoliceAnalyticsFilters;
}

// Statistics Response
export interface PoliceStatisticsResponse {
  success: boolean;
  data: {
    incident_trends: IncidentTrendItem[];
    incident_type_distribution: IncidentTypeDistribution[];
    district_incidents: DistrictIncidentItem[];
    verification_trends: VerificationTrendItem[];
  };
  filters?: PoliceAnalyticsFilters;
}

// Export Response
export interface ExportPoliceAnalyticsResponse {
  success: boolean;
  message: string;
}