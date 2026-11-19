export type FeeType     = 'registration' | 'hiring' | 'commission';
export type FeeCurrency = 'RWF' | 'USD';
export type FeePayType  = 'fixed' | 'percentage';
export type FeeStatus   = 0 | 1 | 2; // 0=pending, 1=active, 2=rejected

export interface CompanyFee {
  id: number;
  company_id: number;
  type: FeeType;
  pay_type: FeePayType;
  value: string;
  currency: FeeCurrency | null;
  is_active: FeeStatus;
  rejection_reason: string | null;
  created_by: number;
  approved_by: number | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  company?: { id: number; business_name: string };
  created_by_user?: { id: number; name: string };
  approved_by_user?: { id: number; name: string };
}

export interface CompanyFeesResponse {
  success: boolean;
  data: {
    data: CompanyFee[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CompanyFeeResponse {
  success: boolean;
  message: string;
  data: CompanyFee;
}

export interface CreateFeeRequest {
  company_id: number;
  type: FeeType;
  pay_type: FeePayType;
  value: number;
  currency?: FeeCurrency;
}

export interface UpdateFeeRequest {
  pay_type?: FeePayType;
  value: number;
  currency?: FeeCurrency;
}

// ADD at end of file:
export interface CompanyWallet {
  id: number;
  company_id: number;
  account_no: string;
  balance: string;
  total_earned: string;
  total_withdrawn: string;
  last_credit: string | null;
  last_credited_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequest {
  id: number;
  company_id: number;
  company_wallet_id: number;
  amount: string;
  currency: string;
  payout_account: string;
  payout_channel: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  rejection_reason: string | null;
  transaction_ref: string | null;
  notes: string | null;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface WalletResponse {
  success: boolean;
  data: {
    wallet: CompanyWallet;
    withdrawals: {
      data: WithdrawalRequest[];
      total: number;
      current_page: number;
      last_page: number;
    };
  };
}

export interface RequestWithdrawalRequest {
  amount: number;
  payout_account: string;
  payout_channel: 'momo' | 'bank' | 'cash';
  currency?: 'RWF' | 'USD';
  notes?: string;
}