// Company Transaction Interfaces
export interface CompanyTransactionItem {
  id: number;
  transaction_id: string;
  user_id: number;
  transaction_type: 'company_registration' | 'worker_registration' | 'employer_registration' | 'subscription_fee' | 'salary_deduction';
  amount: string;
  payment_method: string | null;
  payment_phone: string | null;
  payment_reference: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string | null;
  related_company_id: number | null;
  related_worker_id: number | null;
  related_employer_id: number | null;
  receipt_url: string | null;
  paid_at: string | null;
  failure_reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  related_worker?: {
    id: number;
    first_name: string;
    last_name: string;
    user?: {
      phone: string;
    };
  };
  related_employer?: {
    id: number;
    user?: {
      name: string;
      phone: string;
    };
  };
}

export interface CompanyTransactionFilters {
  type?: 'all' | 'company_registration' | 'worker_registration' | 'employer_registration' | 'subscription_fee' | 'salary_deduction';
  status?: 'all' | 'pending' | 'completed' | 'failed' | 'refunded';
  start_date?: string;
  end_date?: string;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
}

export interface CompanyTransactionsListData {
  current_page: number;
  data: CompanyTransactionItem[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface CompanyTransactionsResponse {
  success: boolean;
  data: CompanyTransactionsListData;
  summary?: {
    total_transactions: number;
    total_amount: number;
    completed_transactions: number;
  };
}

export interface CompanyTransactionDetails {
  id: number;
  transaction_id: string;
  type: string;
  type_label: string;
  amount: number;
  formatted_amount: string;
  status: string;
  payment_method: string;
  payment_method_label: string;
  payment_reference: string | null;
  payment_phone: string | null;
  description: string | null;
  receipt_url: string | null;
  failure_reason: string | null;
  created_at: string;
  paid_at: string | null;
  metadata: Record<string, unknown> | null;
  related_entity: {
    type: string;
    name: string;
  };
}

export interface CompanyTransactionDetailsResponse {
  success: boolean;
  data: CompanyTransactionDetails;
}

export interface CompanyTransactionStatistics {
  summary: {
    total_transactions: number;
    total_revenue: number;
    pending_transactions: number;
    failed_transactions: number;
    success_rate: number;
  };
  monthly_revenue: Array<{
    month: string;
    total: number;
    count: number;
  }>;
  revenue_by_type: Record<string, number>;
  recent_transactions: Array<{
    id: number;
    transaction_id: string;
    type: string;
    amount: number;
    status: string;
    date: string;
    description: string;
    payment_method: string;
  }>;
  daily_revenue: Array<{
    date: string;
    total: number;
  }>;
  transaction_types: Record<string, {
    total: number;
    count: number;
    label: string;
  }>;
}

export interface CompanyTransactionStatisticsResponse {
  success: boolean;
  data: CompanyTransactionStatistics;
}