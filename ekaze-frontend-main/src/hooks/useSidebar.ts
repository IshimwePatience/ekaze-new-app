import { useQuery } from '@tanstack/react-query';
import { sidebarApi } from '@/api/sidebarService';

// Query Keys
export const sidebarKeys = {
  all: ['sidebar'] as const,
  data: () => [...sidebarKeys.all, 'data'] as const,
  user: () => [...sidebarKeys.all, 'user'] as const,
  dashboard: () => [...sidebarKeys.all, 'dashboard'] as const,
  companyData: () => [...sidebarKeys.all, 'company-data'] as const,
  companyAnalytics: () => [...sidebarKeys.all, 'company-analytics'] as const,
  workerData: () => [...sidebarKeys.all, 'worker-data'] as const,
  workerDashboard: () => [...sidebarKeys.all, 'worker-dashboard'] as const, 
};

// Get combined sidebar data (for employer)
export const useSidebarData = () => {
  return useQuery({
    queryKey: sidebarKeys.data(),
    queryFn: () => sidebarApi.getSidebarData(),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
};

// Get combined company sidebar data
export const useCompanySidebarData = () => {
  return useQuery({
    queryKey: sidebarKeys.companyData(),
    queryFn: () => sidebarApi.getCompanySidebarData(),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
};

// Get user profile only
export const useUserProfile = () => {
  return useQuery({
    queryKey: sidebarKeys.user(),
    queryFn: () => sidebarApi.getUserProfile(),
    staleTime: 300000, // 5 minutes
  });
};

// Get dashboard data only
export const useDashboard = () => {
  return useQuery({
    queryKey: sidebarKeys.dashboard(),
    queryFn: () => sidebarApi.getDashboard(),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
};

// Get company analytics only
export const useCompanyAnalytics = () => {
  return useQuery({
    queryKey: sidebarKeys.companyAnalytics(),
    queryFn: () => sidebarApi.getCompanyAnalytics(),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
};

// Get combined worker sidebar data
export const useWorkerSidebarData = () => {
  return useQuery({
    queryKey: sidebarKeys.workerData(),
    queryFn: () => sidebarApi.getWorkerSidebarData(),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
};

// Get worker dashboard data only
export const useWorkerDashboard = () => {
  return useQuery({
    queryKey: sidebarKeys.workerDashboard(),
    queryFn: () => sidebarApi.getWorkerDashboard(),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
};