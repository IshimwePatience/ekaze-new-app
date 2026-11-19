export interface UsageStatisticsData {
  // Landing page stat cards
  workers_registered: number;
  happy_employers: number;
  partner_companies: number;
  verified_profiles_percent: number;

  // Extra detail
  nida_verified_workers: number;
  total_employers: number;
  total_companies: number;
  fully_complete_profiles: number;
}

export interface UsageStatisticsResponse {
  success: boolean;
  data: UsageStatisticsData;
  generated_at: string;
}