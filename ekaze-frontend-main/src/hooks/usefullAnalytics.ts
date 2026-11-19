import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/fullanalyticsService';
import type { AnalyticsFilters } from '@/types/fullanalytics.types';

// Role comes from whoever calls the hook — supervisor page passes 'supervisor', admin passes 'admin'
type AnalyticsRole = 'admin' | 'supervisor';

// ── Query key factory ────────────────────────────────────────────────────────
export const analyticsKeys = {
  all:            (role: AnalyticsRole)                               => [role, 'analytics'] as const,
  overview:       (role: AnalyticsRole, f?: AnalyticsFilters)         => [...analyticsKeys.all(role), 'overview', f] as const,
  users:          (role: AnalyticsRole, f?: AnalyticsFilters)         => [...analyticsKeys.all(role), 'users', f] as const,
  workers:        (role: AnalyticsRole, f?: AnalyticsFilters)         => [...analyticsKeys.all(role), 'workers', f] as const,
  employments:    (role: AnalyticsRole, f?: AnalyticsFilters)         => [...analyticsKeys.all(role), 'employments', f] as const,
  companies:      (role: AnalyticsRole, f?: AnalyticsFilters)         => [...analyticsKeys.all(role), 'companies', f] as const,
  transactions:   (role: AnalyticsRole, f?: AnalyticsFilters)         => [...analyticsKeys.all(role), 'transactions', f] as const,
  hiringRequests: (role: AnalyticsRole, f?: AnalyticsFilters)         => [...analyticsKeys.all(role), 'hiring-requests', f] as const,
  incidents:      (role: AnalyticsRole, f?: AnalyticsFilters)         => [...analyticsKeys.all(role), 'incidents', f] as const,
  agents:         (role: AnalyticsRole, f?: AnalyticsFilters)         => [...analyticsKeys.all(role), 'agents', f] as const,
  geography:      (role: AnalyticsRole, f?: AnalyticsFilters)         => [...analyticsKeys.all(role), 'geography', f] as const,
  growth:         (role: AnalyticsRole, f?: AnalyticsFilters)         => [...analyticsKeys.all(role), 'growth', f] as const,
  employers:      (role: AnalyticsRole, f?: AnalyticsFilters)         => [...analyticsKeys.all(role), 'employers', f] as const,
};

const STALE = 60_000; // 1 minute

// ── 1. Overview ─────────────────────────────────────────────────────────────
export const useAnalyticsOverview = (role: AnalyticsRole, filters?: AnalyticsFilters) =>
  useQuery({
    queryKey: analyticsKeys.overview(role, filters),
    queryFn: () => analyticsApi.getOverview(role, filters),
    staleTime: STALE,
  });

// ── 2. Users ────────────────────────────────────────────────────────────────
export const useAnalyticsUsers = (role: AnalyticsRole, filters?: AnalyticsFilters) =>
  useQuery({
    queryKey: analyticsKeys.users(role, filters),
    queryFn: () => analyticsApi.getUsers(role, filters),
    staleTime: STALE,
  });

// ── 3. Workers ──────────────────────────────────────────────────────────────
export const useAnalyticsWorkers = (role: AnalyticsRole, filters?: AnalyticsFilters) =>
  useQuery({
    queryKey: analyticsKeys.workers(role, filters),
    queryFn: () => analyticsApi.getWorkers(role, filters),
    staleTime: STALE,
  });

// ── 4. Employments ──────────────────────────────────────────────────────────
export const useAnalyticsEmployments = (role: AnalyticsRole, filters?: AnalyticsFilters) =>
  useQuery({
    queryKey: analyticsKeys.employments(role, filters),
    queryFn: () => analyticsApi.getEmployments(role, filters),
    staleTime: STALE,
  });

// ── 5. Companies ────────────────────────────────────────────────────────────
export const useAnalyticsCompanies = (role: AnalyticsRole, filters?: AnalyticsFilters) =>
  useQuery({
    queryKey: analyticsKeys.companies(role, filters),
    queryFn: () => analyticsApi.getCompanies(role, filters),
    staleTime: STALE,
  });

// ── 6. Transactions ─────────────────────────────────────────────────────────
export const useAnalyticsTransactions = (role: AnalyticsRole, filters?: AnalyticsFilters) =>
  useQuery({
    queryKey: analyticsKeys.transactions(role, filters),
    queryFn: () => analyticsApi.getTransactions(role, filters),
    staleTime: STALE,
  });

// ── 7. Hiring Requests ──────────────────────────────────────────────────────
export const useAnalyticsHiringRequests = (role: AnalyticsRole, filters?: AnalyticsFilters) =>
  useQuery({
    queryKey: analyticsKeys.hiringRequests(role, filters),
    queryFn: () => analyticsApi.getHiringRequests(role, filters),
    staleTime: STALE,
  });

// ── 8. Incidents ────────────────────────────────────────────────────────────
export const useAnalyticsIncidents = (role: AnalyticsRole, filters?: AnalyticsFilters) =>
  useQuery({
    queryKey: analyticsKeys.incidents(role, filters),
    queryFn: () => analyticsApi.getIncidents(role, filters),
    staleTime: STALE,
  });

// ── 9. Agents ───────────────────────────────────────────────────────────────
export const useAnalyticsAgents = (role: AnalyticsRole, filters?: AnalyticsFilters) =>
  useQuery({
    queryKey: analyticsKeys.agents(role, filters),
    queryFn: () => analyticsApi.getAgents(role, filters),
    staleTime: STALE,
  });

// ── 10. Geography ───────────────────────────────────────────────────────────
export const useAnalyticsGeography = (role: AnalyticsRole, filters?: AnalyticsFilters) =>
  useQuery({
    queryKey: analyticsKeys.geography(role, filters),
    queryFn: () => analyticsApi.getGeography(role, filters),
    staleTime: STALE,
  });

// ── 11. Growth ──────────────────────────────────────────────────────────────
export const useAnalyticsGrowth = (role: AnalyticsRole, filters?: AnalyticsFilters) =>
  useQuery({
    queryKey: analyticsKeys.growth(role, filters),
    queryFn: () => analyticsApi.getGrowth(role, filters),
    staleTime: STALE,
  });

// ── 12. Employers ───────────────────────────────────────────────────────────
export const useAnalyticsEmployers = (role: AnalyticsRole, filters?: AnalyticsFilters) =>
  useQuery({
    queryKey: analyticsKeys.employers(role, filters),
    queryFn: () => analyticsApi.getEmployers(role, filters),
    staleTime: STALE,
  });