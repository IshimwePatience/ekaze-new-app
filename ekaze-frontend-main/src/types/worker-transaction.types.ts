export interface WorkerTransactionItem {
  id: number;
  transaction_id: string;
  user_id: number;
  related_worker_id: number;
  related_employer_id: number | null;
  related_company_id: number | null;
  transaction_type: 'worker_registration' | 'subscription_fee' | 'salary_deduction';
  amount: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: string | null;
  payment_reference: string | null;
  payment_phone: string | null;
  description: string | null;
  receipt_url: string | null;
  failure_reason: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  employer?: {
    name: string;
    phone: string;
  } | null;
  company?: {
    name: string;
  } | null;
}

export interface WorkerTransactionFilters {
  type?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  per_page?: number;
}

export interface WorkerTransactionsResponse {
  success: boolean;
  data: {
    current_page: number;
    data: WorkerTransactionItem[];
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
  };
  summary: {
    total_transactions: number;
    total_amount: number;
  };
}

export interface WorkerTransactionStatistics {
  summary: {
    total_transactions: number;
    total_earnings: number;
    pending_transactions: number;
    failed_transactions: number;
    success_rate: number;
  };
  monthly_earnings: Array<{
    month: string;
    total: number;
    count: number;
  }>;
  earnings_by_type: Record<string, number>;
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
  daily_earnings: Array<{
    date: string;
    total: number;
  }>;
  transaction_types: Record<string, {
    total: number;
    count: number;
  }>;
}

export interface WorkerTransactionStatisticsResponse {
  success: boolean;
  data: WorkerTransactionStatistics;
}

export interface WorkerTransactionDetailsResponse {
  success: boolean;
  data: WorkerTransactionItem;
}