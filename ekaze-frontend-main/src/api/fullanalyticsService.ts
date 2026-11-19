import api from '@/lib/api';
import type {
  AnalyticsFilters,
  OverviewResponse,
  UsersAnalyticsResponse,
  WorkersAnalyticsResponse,
  EmploymentsAnalyticsResponse,
  CompaniesAnalyticsResponse,
  TransactionsAnalyticsResponse,
  HiringRequestsAnalyticsResponse,
  IncidentsAnalyticsResponse,
  AgentsAnalyticsResponse,
  GeographyAnalyticsResponse,
  GrowthAnalyticsResponse,
  EmployersAnalyticsResponse,
} from '@/types/fullanalytics.types';

// Role prefix — same controller serves both admin and supervisor
type AnalyticsRole = 'admin' | 'supervisor';

function buildParams(filters?: AnalyticsFilters): Record<string, unknown> {
  if (!filters) return {};
  // Strip undefined values so axios doesn't send empty query params
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
}

export const analyticsApi = {
  // ── 1. Overview ──────────────────────────────────────────
  getOverview: (role: AnalyticsRole, filters?: AnalyticsFilters) =>
    api
      .get<OverviewResponse>(`/${role}/analytics/overview`, { params: buildParams(filters) })
      .then((r) => r.data),

  // ── 2. Users ─────────────────────────────────────────────
  getUsers: (role: AnalyticsRole, filters?: AnalyticsFilters) =>
    api
      .get<UsersAnalyticsResponse>(`/${role}/analytics/users`, { params: buildParams(filters) })
      .then((r) => r.data),

  // ── 3. Workers ───────────────────────────────────────────
  getWorkers: (role: AnalyticsRole, filters?: AnalyticsFilters) =>
    api
      .get<WorkersAnalyticsResponse>(`/${role}/analytics/workers`, { params: buildParams(filters) })
      .then((r) => r.data),

  // ── 4. Employments ───────────────────────────────────────
  getEmployments: (role: AnalyticsRole, filters?: AnalyticsFilters) =>
    api
      .get<EmploymentsAnalyticsResponse>(`/${role}/analytics/employments`, {
        params: buildParams(filters),
      })
      .then((r) => r.data),

  // ── 5. Companies ─────────────────────────────────────────
  getCompanies: (role: AnalyticsRole, filters?: AnalyticsFilters) =>
    api
      .get<CompaniesAnalyticsResponse>(`/${role}/analytics/companies`, {
        params: buildParams(filters),
      })
      .then((r) => r.data),

  // ── 6. Transactions ──────────────────────────────────────
  getTransactions: (role: AnalyticsRole, filters?: AnalyticsFilters) =>
    api
      .get<TransactionsAnalyticsResponse>(`/${role}/analytics/transactions`, {
        params: buildParams(filters),
      })
      .then((r) => r.data),

  // ── 7. Hiring Requests ───────────────────────────────────
  getHiringRequests: (role: AnalyticsRole, filters?: AnalyticsFilters) =>
    api
      .get<HiringRequestsAnalyticsResponse>(`/${role}/analytics/hiring-requests`, {
        params: buildParams(filters),
      })
      .then((r) => r.data),

  // ── 8. Incidents ─────────────────────────────────────────
  getIncidents: (role: AnalyticsRole, filters?: AnalyticsFilters) =>
    api
      .get<IncidentsAnalyticsResponse>(`/${role}/analytics/incidents`, {
        params: buildParams(filters),
      })
      .then((r) => r.data),

  // ── 9. Agents ────────────────────────────────────────────
  getAgents: (role: AnalyticsRole, filters?: AnalyticsFilters) =>
    api
      .get<AgentsAnalyticsResponse>(`/${role}/analytics/agents`, { params: buildParams(filters) })
      .then((r) => r.data),

  // ── 10. Geography ────────────────────────────────────────
  getGeography: (role: AnalyticsRole, filters?: AnalyticsFilters) =>
    api
      .get<GeographyAnalyticsResponse>(`/${role}/analytics/geography`, {
        params: buildParams(filters),
      })
      .then((r) => r.data),

  // ── 11. Growth ───────────────────────────────────────────
  getGrowth: (role: AnalyticsRole, filters?: AnalyticsFilters) =>
    api
      .get<GrowthAnalyticsResponse>(`/${role}/analytics/growth`, { params: buildParams(filters) })
      .then((r) => r.data),

  // ── 12. Employers ────────────────────────────────────────
  getEmployers: (role: AnalyticsRole, filters?: AnalyticsFilters) =>
    api
      .get<EmployersAnalyticsResponse>(`/${role}/analytics/employers`, {
        params: buildParams(filters),
      })
      .then((r) => r.data),
};