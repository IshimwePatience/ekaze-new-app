export type ScheduleStatus = 'pending' | 'paid' | 'overdue' | 'extended' | 'disputed' | 'confirmed';
export type ExtensionStatus = 'pending' | 'approved' | 'rejected';
export type DisputeStatus   = 'open' | 'resolved' | 'dismissed';

export interface PaymentSchedule {
  id: number;
  employment_id: number;
  employer_id: number;
  worker_id: number;
  due_date: string;
  amount: string;
  status: ScheduleStatus;
  employer_paid_at: string | null;
  payment_confirmed_at: string | null;
  payment_reference: string | null;
  reminder_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  worker?: {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    user?: { phone?: string; profile_photo?: string | null };
  };
  employer?: {
    id: number;
    user?: { name: string; phone?: string };
  };
  active_extension?: PaymentExtension | null;
  disputes?: PaymentDispute[];
}

export interface PaymentExtension {
  id: number;
  schedule_id: number;
  employment_id: number;
  employer_id: number;
  worker_id: number;
  original_due_date: string;
  requested_new_date: string;
  reason: string;
  status: ExtensionStatus;
  worker_responded_at: string | null;
  worker_response_note: string | null;
  created_at: string;
}

export interface PaymentDispute {
  id: number;
  schedule_id: number;
  worker_id: number;
  employer_id: number;
  description: string;
  status: DisputeStatus;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export interface PaymentSchedulesResponse {
  success: boolean;
  data: {
    data: PaymentSchedule[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface MarkPaidRequest {
  payment_reference: string;
  notes?: string;
}

export interface RequestExtensionRequest {
  requested_new_date: string;
  reason: string;
}

export interface RespondExtensionRequest {
  response: 'approved' | 'rejected';
  response_note?: string;
}

export interface RaiseDisputeRequest {
  description: string;
}

export interface ConfirmPaymentRequest {
  notes?: string;
}