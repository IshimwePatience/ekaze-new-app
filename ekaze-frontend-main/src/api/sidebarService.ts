import api from '@/lib/api';
import type {
  UserProfileResponse,
  DashboardResponse,
  CompanyAnalyticsResponse,
  CompanyWorkersResponse,
  WorkerDashboardResponse,
  SidebarResponse,
  CompanySidebarResponse,
  WorkerSidebarResponse,
  SidebarData,
  CompanySidebarData,
  WorkerSidebarData, 
} from '@/types/sidebar.types';

export const sidebarApi = {
  // Get user profile
  getUserProfile: async (): Promise<UserProfileResponse> => {
    const response = await api.get<UserProfileResponse>('/me');
    return response.data;
  },

  // Get employer dashboard data
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>('/employer/dashboard');
    return response.data;
  },

  // Get company analytics data
  getCompanyAnalytics: async (): Promise<CompanyAnalyticsResponse> => {
    const response = await api.get<CompanyAnalyticsResponse>('/company/analytics');
    return response.data;
  },
  // Get company workers data
  getCompanyWorkers: async (page = 1, per_page = 10): Promise<CompanyWorkersResponse> => {
    const response = await api.get<CompanyWorkersResponse>(
      `/company/workers?page=${page}&per_page=${per_page}`
    );
    return response.data;
  },

  // Get worker dashboard data
  getWorkerDashboard: async (): Promise<WorkerDashboardResponse> => {
    const response = await api.get<WorkerDashboardResponse>('/worker/dashboard');
    return response.data;
  },

  // Get combined worker sidebar data
  getWorkerSidebarData: async (): Promise<WorkerSidebarResponse> => {
    // Fetch worker dashboard data
    const dashboardResponse = await sidebarApi.getWorkerDashboard();

    // Return the data directly as it already has the structure we need
    const workerSidebarData: WorkerSidebarData = {
      user: dashboardResponse.data.user,
      worker: dashboardResponse.data.worker,
      statistics: dashboardResponse.data.statistics,
      current_employment: dashboardResponse.data.current_employment,
    };

    return {
      success: true,
      data: workerSidebarData,
    };
  },

  // Get combined sidebar data (for employer)
  getSidebarData: async (): Promise<SidebarResponse> => {
    // Fetch both user profile and dashboard data in parallel
    const [userResponse, dashboardResponse] = await Promise.all([
      sidebarApi.getUserProfile(),
      sidebarApi.getDashboard(),
    ]);

    // Combine the data
    const sidebarData: SidebarData = {
      user: userResponse.user,
      statistics: {
        active_workers: dashboardResponse.data.statistics.workers.active,
        this_month_spent: dashboardResponse.data.statistics.transactions.this_month_spent,
      },
      recent_workers: dashboardResponse.data.recent_activities.recent_workers,
    };

    return {
      success: true,
      data: sidebarData,
    };
  },

  // Get combined company sidebar data
// Get combined company sidebar data
  getCompanySidebarData: async (): Promise<CompanySidebarResponse> => {
    // Fetch user profile, analytics, and workers data in parallel
    const [userResponse, analyticsResponse, workersResponse] = await Promise.all([
      sidebarApi.getUserProfile(),
      sidebarApi.getCompanyAnalytics(),
      sidebarApi.getCompanyWorkers(1, 2), // Get only 2 workers for sidebar
    ]);

    // Calculate this month's revenue from revenue_trends
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    const thisMonthRevenue = analyticsResponse.data.revenue_trends
      .filter(trend => trend.date.startsWith(currentMonth))
      .reduce((sum, trend) => sum + parseFloat(trend.total), 0);

    // Calculate previous month's revenue for growth percentage
    const previousMonthDate = new Date();
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    const previousMonth = previousMonthDate.toISOString().slice(0, 7);
    const previousMonthRevenue = analyticsResponse.data.revenue_trends
      .filter(trend => trend.date.startsWith(previousMonth))
      .reduce((sum, trend) => sum + parseFloat(trend.total), 0);

    // Calculate growth percentage
    const revenueGrowth = previousMonthRevenue > 0
      ? ((thisMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

    // Combine the data
    const companySidebarData: CompanySidebarData = {
      user: userResponse.user,
      statistics: {
        total_workers: userResponse.user.company?.total_workers || 0,
        active_workers: userResponse.user.company?.active_workers || 0,
        active_employments: analyticsResponse.data.employment_stats.active,
        this_month_revenue: thisMonthRevenue.toFixed(2),
        revenue_growth_percentage: Math.round(revenueGrowth),
      },
      recent_workers: workersResponse.data.data,
    };

    return {
      success: true,
      data: companySidebarData,
    };
  },
};