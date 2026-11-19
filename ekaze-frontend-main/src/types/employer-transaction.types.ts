export interface TransactionMetadata {
  [key: string]: string | number | boolean | null | undefined | TransactionMetadata | Array<string | number | boolean | null | undefined | TransactionMetadata>;
}

export interface TransactionFilters {
  transaction_type?: 'company_registration' | 'worker_registration' | 'employer_registration' | 'subscription_fee' | 'salary_deduction' | 'all';
  status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'all';
  payment_method?: 'mobile_money' | 'bank_transfer' | 'cash' | 'all';
  from_date?: string;
  to_date?: string;
  min_amount?: number;
  max_amount?: number;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface RelatedCompany {
  id: number;
  business_name: string;
}

export interface RelatedWorker {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface RelatedEmployer {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
}

export interface Transaction {
  id: number;
  transaction_id: string;
  user_id: number;
  transaction_type: 'company_registration' | 'worker_registration' | 'employer_registration' | 'subscription_fee' | 'salary_deduction';
  amount: number | string;
  payment_method: 'mobile_money' | 'bank_transfer' | 'cash';
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
  metadata: TransactionMetadata | null;
  created_at: string;
  updated_at: string;
  related_company?: RelatedCompany | null;
  related_worker?: RelatedWorker | null;
  related_employer?: RelatedEmployer | null;
}

export interface TransactionStatistics {
  total_transactions: number;
  completed_transactions: number;
  pending_transactions: number;
  failed_transactions: number;
  total_amount_paid: number | string;
  average_transaction_amount: number | string;
}

export interface TransactionListResponse {
  success: boolean;
  data: {
    data: Transaction[];
    current_page: number;
    from: number;
    to: number;
    total: number;
    per_page: number;
    last_page: number;
  };
}

export interface TransactionStatisticsResponse {
  success: boolean;
  data: TransactionStatistics;
}

export interface TransactionDetailsResponse {
  success: boolean;
  data: Transaction;
}