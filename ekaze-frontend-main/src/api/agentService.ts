import api from '@/lib/api';
import type {
  AgentWalletResponse,
  AgentSalesResponse,
  AgentsListResponse,
  AgentDetailsResponse,
  AdminAgentAnalyticsResponse,
  AssignWholesaleRequest,
  RecordSaleRequest,
} from '@/types/agent.types';

export const agentApi = {
  // ── WORKER (agent self) ───────────────────────────────
  getMyWallet: async (): Promise<AgentWalletResponse> => {
    const r = await api.get<AgentWalletResponse>('/worker/agent/wallet');
    return r.data;
  },

  selfAssignWholesale: async (data: AssignWholesaleRequest) => {
    const r = await api.post('/worker/agent/wholesale', data);
    return r.data;
  },

  getMySales: async (params?: { product_type?: string; from_date?: string; to_date?: string; page?: number }): Promise<AgentSalesResponse> => {
    const q = new URLSearchParams();
    if (params?.product_type) q.append('product_type', params.product_type);
    if (params?.from_date)    q.append('from_date',    params.from_date);
    if (params?.to_date)      q.append('to_date',      params.to_date);
    if (params?.page)         q.append('page',         params.page.toString());
    const r = await api.get<AgentSalesResponse>(`/worker/agent/sales?${q}`);
    return r.data;
  },

  recordSale: async (data: RecordSaleRequest) => {
    const r = await api.post('/worker/agent/sales', data);
    return r.data;
  },

    // ── EMPLOYER ─────────────────────────────────────────
  getEmployerAgentAnalytics: async () => {
    const r = await api.get('/employer/agents/analytics');
    return r.data;
  },

  // ── COMPANY ──────────────────────────────────────────
getCompanyAgentAnalytics: async () => {
  const r = await api.get('/company/agents/analytics');
  return r.data;
},

  // ── EMPLOYER ─────────────────────────────────────────
  getEmployerAgents: async (): Promise<AgentsListResponse> => {
    const r = await api.get<AgentsListResponse>('/employer/agents');
    return r.data;
  },

  getEmployerAgentDetails: async (workerId: number): Promise<AgentDetailsResponse> => {
    const r = await api.get<AgentDetailsResponse>(`/employer/agents/${workerId}`);
    return r.data;
  },

  employerAssignWholesale: async (workerId: number, data: AssignWholesaleRequest) => {
    const r = await api.post(`/employer/agents/${workerId}/wholesale`, data);
    return r.data;
  },

  // ── COMPANY ──────────────────────────────────────────
  getCompanyAgents: async (): Promise<AgentsListResponse> => {
    const r = await api.get<AgentsListResponse>('/company/agents');
    return r.data;
  },

  getCompanyAgentDetails: async (workerId: number): Promise<AgentDetailsResponse> => {
  const r = await api.get<AgentDetailsResponse>(`/company/agents/${workerId}`);
  return r.data;
},

  companyAssignWholesale: async (workerId: number, data: AssignWholesaleRequest) => {
    const r = await api.post(`/company/agents/${workerId}/wholesale`, data);
    return r.data;
  },

  // ── ADMIN ────────────────────────────────────────────
  getAdminAgentAnalytics: async (): Promise<AdminAgentAnalyticsResponse> => {
    const r = await api.get<AdminAgentAnalyticsResponse>('/admin/agents/analytics');
    return r.data;
  },

  getAdminAgentDetails: async (workerId: number): Promise<AgentDetailsResponse> => {
    const r = await api.get<AgentDetailsResponse>(`/admin/agents/${workerId}`);
    return r.data;
  },
};