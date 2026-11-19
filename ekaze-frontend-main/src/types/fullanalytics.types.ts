// ============================================================
// SHARED FILTER TYPES
// ============================================================

export type AnalyticsPeriod =
  | 'today'
  | 'week'
  | 'month'
  | 'year'
  | 'custom';

export interface AnalyticsFilters {
  period?: AnalyticsPeriod;
  start_date?: string;
  end_date?: string;
  company_id?: number;
  employer_id?: number;
  worker_id?: number;
  district?: string;
  experience_level?: string;
  status?: string;
  severity?: string;
  type?: string;
  payment_method?: string;
}

// ============================================================
// SHARED PRIMITIVES
// ============================================================

export interface TrendPoint {
  period: string;
  count: number;
}

export interface RevenueTrendPoint {
  period: string;
  total: number;
  count: number;
}

export interface LabelCount {
  label: string;
  count: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface RoleCount {
  role: string;
  count: number;
}

export interface GrowthKpi {
  current: number;
  previous: number;
  growth: number;
  all_time: number;
}

// ============================================================
// 1. OVERVIEW
// ============================================================

export interface OverviewKpis {
  users: GrowthKpi;
  workers: GrowthKpi;
  companies: GrowthKpi;
  employers: GrowthKpi;
  revenue: GrowthKpi;
  incidents: GrowthKpi;
  hiring_requests: Pick<GrowthKpi, 'current' | 'all_time'>;
  employments: Pick<GrowthKpi, 'current' | 'all_time'>;
}

export interface OverviewQuickStats {
  active_workers: number;
  hired_workers: number;
  active_companies: number;
  pending_companies: number;
  open_incidents: number;
  pending_hirings: number;
  active_employments: number;
}

export interface OverviewData {
  kpis: OverviewKpis;
  quick_stats: OverviewQuickStats;
}

export interface OverviewResponse {
  success: boolean;
  period: AnalyticsPeriod;
  data: OverviewData;
}

// ============================================================
// 2. USERS
// ============================================================

export interface UsersByProvince {
  province: string;
  count: number;
}

export type UserVerificationStat = LabelCount;

export interface UsersData {
  registration_trend: TrendPoint[];
  by_role: RoleCount[];
  by_status: StatusCount[];
  by_gender: Array<{ gender: string | null; count: number }>;
  verification_stats: UserVerificationStat[];
  by_province: UsersByProvince[];
  recently_active: TrendPoint[];
}

export interface UsersAnalyticsResponse {
  success: boolean;
  filters: AnalyticsFilters & { start: string; end: string };
  data: UsersData;
}

// ============================================================
// 3. WORKERS
// ============================================================

export interface TopRatedWorker {
  id: number;
  name: string;
  average_rating: string;
  total_ratings: number;
  total_employments: number;
}

export interface WorkerPerCompany {
  company: string;
  count: number;
}

export interface WorkersData {
  registration_trend: TrendPoint[];
  by_status: Array<{ availability_status: string; count: number }>;
  by_registration_type: Array<{ registration_type: string; count: number }>;
  by_experience: Array<{ experience_level: string | null; count: number }>;
  nida_stats: LabelCount[];
  insurance_stats: LabelCount[];
  top_rated: TopRatedWorker[];
  by_district: Array<{ district: string; count: number }>;
  salary_distribution: Array<{ range: string; count: number }>;
  per_company: WorkerPerCompany[];
}

export interface WorkersAnalyticsResponse {
  success: boolean;
  filters: AnalyticsFilters & { start: string; end: string };
  data: WorkersData;
}

// ============================================================
// 4. EMPLOYMENTS
// ============================================================

export interface AvgSalaryTrendPoint {
  period: string;
  avg_salary: string;
}

export interface SubscriptionRevenueTrendPoint {
  period: string;
  total_fees: string;
}

export interface TopEmployer {
  employer_name: string;
  count: number;
  total_salary: string;
}

export interface EmploymentsSummary {
  total: number;
  active: number;
  completed: number;
  terminated: number;
  avg_salary: number;
  avg_duration_days: number;
  total_subscription: number;
}

export interface EmploymentsData {
  trend: TrendPoint[];
  by_status: StatusCount[];
  otp_stats: LabelCount[];
  avg_salary_trend: AvgSalaryTrendPoint[];
  duration_distribution: Array<{ duration_range: string; count: number }>;
  termination_reasons: Array<{ termination_reason: string; count: number }>;
  top_employers: TopEmployer[];
  subscription_revenue: SubscriptionRevenueTrendPoint[];
  summary: EmploymentsSummary;
}

export interface EmploymentsAnalyticsResponse {
  success: boolean;
  filters: AnalyticsFilters;
  data: EmploymentsData;
}

// ============================================================
// 5. COMPANIES
// ============================================================

export interface CompanyWorkerCount {
  business_name: string;
  total_workers: number;
  active_workers: number;
  available_workers: number;
}

export interface CompanyRevenue {
  business_name: string;
  total_revenue: string;
}

export interface CompanyApprovalTime {
  approval_duration: string;
  count: number;
}

export interface CompanyDetailSection {
  info: {
    id: number;
    business_name: string;
    tin: string;
    status: string;
    total_workers: number;
    active_workers: number;
    total_revenue: string;
    subscription_fee: string;
  };
  workers_by_status: Array<{ availability_status: string; count: number }>;
  hiring_requests: StatusCount[];
  incidents: StatusCount[];
  revenue_trend: Array<{ period: string; total: string }>;
}

export interface CompaniesSummary {
  total: number;
  approved: number;
  pending: number;
  suspended: number;
  rejected: number;
}

export interface CompaniesData {
  trend: TrendPoint[];
  by_status: StatusCount[];
  by_worker_count: CompanyWorkerCount[];
  revenue_per_company: CompanyRevenue[];
  approval_time: CompanyApprovalTime[];
  subscription_fees: Array<{ fee_range: string; count: number }>;
  company_detail: CompanyDetailSection | null;
  summary: CompaniesSummary;
}

export interface CompaniesAnalyticsResponse {
  success: boolean;
  filters: AnalyticsFilters;
  data: CompaniesData;
}

// ============================================================
// 6. TRANSACTIONS
// ============================================================

export interface TransactionByType {
  transaction_type: string;
  count: number;
  total: string;
}

export interface TransactionByMethod {
  payment_method: string;
  count: number;
  total: string;
}

export interface TransactionByStatus {
  status: string;
  count: number;
  total: string;
}

export interface TopPayer {
  name: string;
  role: string;
  total_paid: string;
  tx_count: number;
}

export interface TransactionsSummary {
  total_revenue: number;
  total_count: number;
  completed_count: number;
  failed_count: number;
  pending_count: number;
  avg_amount: number;
  refunded_count: number;
}

export interface TransactionsData {
  revenue_trend: RevenueTrendPoint[];
  by_type: TransactionByType[];
  by_payment_method: TransactionByMethod[];
  by_status: TransactionByStatus[];
  failed_trend: TrendPoint[];
  amount_distribution: Array<{ amount_range: string; count: number }>;
  top_payers: TopPayer[];
  summary: TransactionsSummary;
}

export interface TransactionsAnalyticsResponse {
  success: boolean;
  filters: AnalyticsFilters;
  data: TransactionsData;
}

// ============================================================
// 7. HIRING REQUESTS
// ============================================================

export interface HiringTopEmployer {
  employer_name: string;
  total_requests: number;
  accepted: number;
}

export interface HiringTopWorker {
  worker_name: string;
  request_count: number;
}

export interface HiringRequestsSummary {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  cancelled: number;
  acceptance_rate: number;
  avg_proposed_salary: number;
}

export interface HiringRequestsData {
  trend: TrendPoint[];
  by_status: StatusCount[];
  salary_distribution: Array<{ range: string; count: number }>;
  response_time: Array<{ response_time: string; count: number }>;
  top_employers: HiringTopEmployer[];
  top_requested_workers: HiringTopWorker[];
  summary: HiringRequestsSummary;
}

export interface HiringRequestsAnalyticsResponse {
  success: boolean;
  filters: AnalyticsFilters;
  data: HiringRequestsData;
}

// ============================================================
// 8. INCIDENTS
// ============================================================

export interface IncidentByType {
  incident_type: string;
  count: number;
}

export interface IncidentBySeverity {
  severity: string;
  count: number;
}

export interface IncidentByCompany {
  company: string;
  count: number;
}

export interface OfficerWorkload {
  officer_name: string;
  count: number;
  resolved: number;
}

export interface IncidentsSummary {
  total: number;
  open: number;
  resolved: number;
  dismissed: number;
  critical: number;
  resolution_rate: number;
  avg_days_to_resolve: number;
}

export interface IncidentsData {
  trend: TrendPoint[];
  by_type: IncidentByType[];
  by_severity: IncidentBySeverity[];
  by_status: StatusCount[];
  resolution_time: Array<{ resolution_duration: string; count: number }>;
  by_company: IncidentByCompany[];
  assignment_stats: LabelCount[];
  officer_workload: OfficerWorkload[];
  summary: IncidentsSummary;
}

export interface IncidentsAnalyticsResponse {
  success: boolean;
  filters: AnalyticsFilters;
  data: IncidentsData;
}

// ============================================================
// 9. AGENTS
// ============================================================

export interface TopAgent {
  agent_name: string;
  total_received: string;
  total_sold: string;
  balance: string;
}

export interface AgentWalletTrend {
  period: string;
  count: number;
  total_received: string;
}

export interface AgentsSummary {
  total_agents: number;
  total_balance: number;
  total_received: number;
  total_sold: number;
  avg_balance: number;
  active_agents: number;
}

export interface AgentsData {
  top_by_received: TopAgent[];
  balance_distribution: Array<{ balance_range: string; count: number }>;
  wallet_trend: AgentWalletTrend[];
  activity_stats: LabelCount[];
  summary: AgentsSummary;
}

export interface AgentsAnalyticsResponse {
  success: boolean;
  filters: AnalyticsFilters;
  data: AgentsData;
}

// ============================================================
// 10. GEOGRAPHY
// ============================================================

export interface GeoItem {
  province?: string;
  district?: string;
  count: number;
}

export interface UsersByProvincRole {
  province: string;
  role: string;
  count: number;
}

export interface GeographyData {
  workers_by_province: GeoItem[];
  workers_by_district: GeoItem[];
  employers_by_district: GeoItem[];
  incidents_by_province: GeoItem[];
  users_by_province: UsersByProvincRole[];
}

export interface GeographyAnalyticsResponse {
  success: boolean;
  filters: Pick<AnalyticsFilters, 'period'> & { start: string; end: string };
  data: GeographyData;
}

// ============================================================
// 11. GROWTH
// ============================================================

export interface GrowthMultiLinePoint {
  period: string;
  users: number;
  workers: number;
  companies: number;
  employers: number;
  revenue: number;
}

export interface MomEntity {
  this_month: number;
  last_month: number;
  growth_rate: number;
}

export interface GrowthData {
  multi_line: GrowthMultiLinePoint[];
  mom_comparison: {
    users: MomEntity;
    workers: MomEntity;
    companies: MomEntity;
    employers: MomEntity;
  };
}

export interface GrowthAnalyticsResponse {
  success: boolean;
  filters: Pick<AnalyticsFilters, 'period'> & { start: string; end: string };
  data: GrowthData;
}

// ============================================================
// 12. EMPLOYERS ANALYTICS
// ============================================================

export interface EmployerTopByHired {
  name: string;
  total_workers_hired: number;
  active_workers: number;
  total_payments_made: string;
}

export interface EmployerDetailSection {
  info: {
    id: number;
    name: string;
    has_paid_registration: boolean;
    active_workers: number;
    total_workers_hired: number;
    total_payments_made: string;
    total_incidents_reported: number;
  };
  hiring_requests: StatusCount[];
  employments: StatusCount[];
  incidents: StatusCount[];
  payments_trend: Array<{ period: string; total: string }>;
}

export interface EmployersSummary {
  total: number;
  paid_registration: number;
  unpaid_registration: number;
  total_active_workers: number;
  total_hired_all_time: number;
  total_payments: number;
}

export interface EmployersData {
  trend: TrendPoint[];
  payment_stats: LabelCount[];
  top_by_hired: EmployerTopByHired[];
  active_workers_distribution: Array<{ range: string; count: number }>;
  employer_detail: EmployerDetailSection | null;
  summary: EmployersSummary;
}

export interface EmployersAnalyticsResponse {
  success: boolean;
  filters: AnalyticsFilters;
  data: EmployersData;
}