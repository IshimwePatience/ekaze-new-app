export type ProductType = 'airtime' | 'momo' | 'data' | 'other';
export type EntryMethod = 'by_sold_amount' | 'by_remaining_balance';

export interface AgentWallet {
  id: number;
  worker_id: number;
  balance: string;
  total_received: string;
  total_sold: string;
  created_at: string;
  updated_at: string;
}

export interface AgentWholesaleAssignment {
  id: number;
  worker_id: number;
  employer_id: number | null;
  company_id: number | null;
  product_type: ProductType;
  amount: string;
  currency: string;
  assigned_by: number;
  assigned_by_role: 'employer' | 'company' | 'agent';
  is_approved: boolean;
  notes: string | null;
  created_at: string;
  assigned_by_user?: { id: number; name: string };
}

export interface AgentSale {
  id: number;
  worker_id: number;
  employer_id: number | null;
  company_id: number | null;
  product_type: ProductType;
  amount_sold: string;
  balance_before: string;
  balance_after: string;
  entry_method: EntryMethod;
  sale_date: string;
  is_approved: boolean;
  notes: string | null;
  created_at: string;
}

export interface AgentSummary {
  worker_id: number;
  full_name: string;
  phone: string;
  district: string;
  profile_photo: string | null;
  employment_id?: number;
  wallet: {
    balance: string | number;
    total_received: string | number;
    total_sold: string | number;
  };
  performance?: number;
}

// ── REQUESTS ──────────────────────────────────────────────

export interface AssignWholesaleRequest {
  product_type: ProductType;
  amount: number;
  currency?: 'RWF' | 'USD';
  notes?: string;
}

export interface RecordSaleRequest {
  product_type: ProductType;
  entry_method: EntryMethod;
  amount: number;
  sale_date: string;
  wholesale_assignment_id?: number;
  notes?: string;
}

// ── RESPONSES ─────────────────────────────────────────────

export interface AgentWalletResponse {
  success: boolean;
  data: {
    wallet: AgentWallet;
    recent_sales: AgentSale[];
    recent_assignments: AgentWholesaleAssignment[];
  };
}

export interface AgentSalesResponse {
  success: boolean;
  data: {
    sales: {
      data: AgentSale[];
      total: number;
      current_page: number;
      last_page: number;
    };
    current_balance: string;
    total_sold: string;
  };
}

export interface AgentsListResponse {
  success: boolean;
  data: {
    agents: AgentSummary[];
    summary: {
      total_agents: number;
      total_float: number;
      total_received: number;
      total_sold: number;
    };
  };
}

export interface AgentDetailsResponse {
  success: boolean;
  data: {
    worker: {
      id: number;
      full_name: string;
      user: { phone: string; district: string; profile_photo: string | null };
    };
    wallet: AgentWallet;
    sales: { data: AgentSale[]; total: number; current_page: number; last_page: number };
    assignments: AgentWholesaleAssignment[];
  };
}

export interface AdminAgentAnalyticsResponse {
  success: boolean;
  data: {
    summary: {
      total_agents: number;
      total_float_balance: number;
      total_received: number;
      total_sold: number;
      avg_performance: number;
    };
    agents: (AgentSummary & { performance: number })[];
    top_performers: (AgentSummary & { performance: number })[];
    by_district: Record<string, {
      count: number;
      total_sold: number;
      total_received: number;
      total_balance: number;
    }>;
  };
}