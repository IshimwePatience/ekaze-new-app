import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api/notificationService';
import { useToast } from '@/hooks/use-toast';
import type { NotificationFilters } from '@/types/notification.types';
import { AxiosError } from 'axios';

interface ErrorResponse {
  message?: string;
}

// Query Keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters?: NotificationFilters) => [...notificationKeys.lists(), filters] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: number) => [...notificationKeys.details(), id] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
  statistics: () => [...notificationKeys.all, 'statistics'] as const,
};

// Get notifications list
export const useNotifications = (filters?: NotificationFilters) => {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationApi.getNotifications(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every 60 seconds
  });
};

// Get single notification
export const useNotification = (id: number) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: async () => {
      const response = await notificationApi.getNotification(id);
      // Invalidate unread count after viewing
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
      return response;
    },
    enabled: !!id,
  });
};

// Get unread count
export const useUnreadCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 20000, // 20 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Get statistics
export const useNotificationStatistics = () => {
  return useQuery({
    queryKey: notificationKeys.statistics(),
    queryFn: () => notificationApi.getStatistics(),
    staleTime: 60000,
  });
};

// Mark as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to mark as read',
        variant: 'destructive',
      });
    },
  });
};

// Mark as unread
export const useMarkAsUnread = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => notificationApi.markAsUnread(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to mark as unread',
        variant: 'destructive',
      });
    },
  });
};

// Mark all as read
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast({
        title: 'Success',
        description: response.message || 'All notifications marked as read',
        variant: 'success',
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to mark all as read',
        variant: 'destructive',
      });
    },
  });
};

// Clear read notifications
export const useClearRead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => notificationApi.clearRead(),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast({
        title: 'Success',
        description: response.message || 'Read notifications cleared',
        variant: 'success',
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to clear notifications',
        variant: 'destructive',
      });
    },
  });
};

// Delete notification
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: number) => notificationApi.deleteNotification(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast({
        title: 'Success',
        description: response.message || 'Notification deleted',
        variant: 'success',
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete notification',
        variant: 'destructive',
      });
    },
  });
};