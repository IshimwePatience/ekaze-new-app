export type CardPaymentStatus = 'idle' | 'initiating' | 'polling' | 'SUCCESSFUL' | 'FAILED' | 'TIMEOUT';

export interface WorkerCardStatusData {
  has_active_card: boolean;
  card_fee: number;
  currency: string;
  latest_payment: {
    status: 'pending' | 'completed' | 'failed';
    card_generated: boolean;
    paid_at: string | null;
    mtn_reference_id: string | null;
  } | null;
}

export interface WorkerCardStatusResponse {
  success: boolean;
  data: WorkerCardStatusData;
}

export interface InitiateCardPaymentResponse {
  success: boolean;
  message: string;
  data: {
    mtn_reference_id: string;
    amount: number;
    currency: string;
    pay_account: string;
  };
}

export interface PollCardPaymentResponse {
  success: boolean;
  data: {
    status: 'pending' | 'completed' | 'failed';
    card_generated: boolean;
    mtn_status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
  };
}

export interface GenerateCardResponse {
  success: boolean;
  message: string;
  data: {
    card_number: string;
    card_url: string;
    download_url: string;
  };
}