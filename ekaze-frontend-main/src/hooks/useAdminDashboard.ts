import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/adminService';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useEffect } from 'react';

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

// Hook to fetch admin dashboard data
export const useAdminDashboard = () => {
  const query = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Handle errors using useEffect
  useEffect(() => {
    if (query.error) {
      const error = query.error as AxiosError<ApiErrorResponse>;
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Failed to load dashboard data';
      
      toast.error(errorMessage);
    }
  }, [query.error]);

  return query;
};