export interface TransactionUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  profile_photo?: string;
  role?: string;
  status?: string;
}

export interface TransactionCompany {
  id: number;
  business_name: string;
  tin: string;
  physical_address?: string;
  user_id?: number;
}

export interface TransactionWorker {
  id: number;
  first_name: string;
  last_name: string;
}

export interface TransactionEmployer {
  id: number;
  user: {
    name: string;
    email: string;
  };
}

export interface Transaction {
  id: number;
  transaction_id: string;
  payment_reference: string | null;
  user_id: number;
  related_company_id?: number | null;
  related_worker_id?: number | null;
  related_employer_id?: number | null;
  amount: string | number;
  transaction_type: 'employer_registration' | 'worker_registration' | 'refund' | 'service_fee' | 'subscription' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'review' | 'refunded';
  payment_method: 'mobile_money' | 'bank_transfer' | 'card' | 'cash' | 'other';
  description?: string | null;
  failure_reason?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  user?: TransactionUser;
  relatedCompany?: TransactionCompany | null;
  related_company?: TransactionCompany | null;
  relatedWorker?: TransactionWorker | null;
  related_worker?: TransactionWorker | null;
  relatedEmployer?: TransactionEmployer | null;
  related_employer?: TransactionEmployer | null;
}

export interface PaginatedTransactions {
  data: Transaction[];
  current_page: number;
  total: number;
  last_page: number;
  per_page: number;
  from?: number;
  to?: number;
  first_page_url?: string;
  last_page_url?: string;
  next_page_url?: string | null;
  prev_page_url?: string | null;
  path?: string;
  links?: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
}

export interface TransactionStatistics {
  total_transactions: number;
  total_revenue: string | number;
  pending_amount: string | number;
  failed_amount: string | number;
  today_revenue: string | number;
  this_month_revenue: string | number;
}

export interface RevenueByType {
  [key: string]: {
    count: number;
    total: number;
  };
}

export interface DailyRevenue {
  date: string;
  count: number;
  total: number;
}

export interface PaymentMethodBreakdown {
  payment_method: string;
  count: number;
  total: number;
}

export interface TopPayer {
  user_id: number;
  transaction_count: number;
  total_spent: number;
  user: {
    name: string;
    email: string;
  };
}

export interface StatusDistribution {
  [key: string]: number;
}

export interface TransactionAnalytics {
  revenue_by_type: RevenueByType;
  daily_revenue: DailyRevenue[];
  payment_methods: PaymentMethodBreakdown[];
  top_payers: TopPayer[];
  status_distribution: StatusDistribution;
}

export interface MarkForReviewRequest {
  review_notes: string;
}

export interface ExportTransactionsRequest {
  format?: "csv" | "json" | "pdf"
  from_date?: string;
  to_date?: string;
  status?: string;
  type?: string;
}

export interface TransactionFilters {
  status?: string;
  type?: string;
  payment_method?: string;
  from_date?: string;
  to_date?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  summary?: TransactionStatistics;
}

export interface TransactionsResponse {
  data: PaginatedTransactions;
  summary: TransactionStatistics;
}

export interface TransactionDetailsResponse {
  data: Transaction;
}

export interface TransactionAnalyticsResponse {
  data: TransactionAnalytics;
}

export interface BaseErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}