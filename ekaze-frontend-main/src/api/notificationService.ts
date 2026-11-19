import api from '@/lib/api';
import type {
  NotificationsResponse,
  NotificationDetailsResponse,
  NotificationCountResponse,
  NotificationStatisticsResponse,
  NotificationActionResponse,
  NotificationFilters,
} from '@/types/notification.types';

const sanitizeText = (text?: string): string => {
  if (!text) return '';
  return text
    .replace(/by Administrator/gi, 'by Ihirwe')
    .replace(/by Admin/gi, 'by Ihirwe')
    .replace(/Administrator/gi, 'Ihirwe')
    .replace(/Support response:/gi, 'Ihirwe Response:');
};

const sanitizeNotification = (item: any) => {
  if (!item) return item;
  return {
    ...item,
    title: sanitizeText(item.title),
    message: sanitizeText(item.message),
  };
};

export const notificationApi = {
  // Get all notifications
  getNotifications: async (filters?: NotificationFilters): Promise<NotificationsResponse> => {
    const response = await api.get('/notifications', { params: filters });
    const resData = response.data;
    if (resData?.data && Array.isArray(resData.data)) {
      resData.data = resData.data.map(sanitizeNotification);
    } else if (resData?.notifications && Array.isArray(resData.notifications)) {
      resData.notifications = resData.notifications.map(sanitizeNotification);
    } else if (Array.isArray(resData)) {
      return resData.map(sanitizeNotification) as any;
    }
    return resData;
  },

  // Get single notification (auto-marks as read)
  getNotification: async (id: number): Promise<NotificationDetailsResponse> => {
    const response = await api.get(`/notifications/${id}`);
    const resData = response.data;
    if (resData?.data) {
      resData.data = sanitizeNotification(resData.data);
    }
    return resData;
  },

  // Get unread count
  getUnreadCount: async (): Promise<NotificationCountResponse> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // Get statistics
  getStatistics: async (): Promise<NotificationStatisticsResponse> => {
    const response = await api.get('/notifications/statistics');
    return response.data;
  },

  // Mark as read
  markAsRead: async (id: number): Promise<NotificationActionResponse> => {
    const response = await api.post(`/notifications/${id}/mark-read`);
    return response.data;
  },

  // Mark as unread
  markAsUnread: async (id: number): Promise<NotificationActionResponse> => {
    const response = await api.post(`/notifications/${id}/mark-unread`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async (): Promise<NotificationActionResponse> => {
    const response = await api.post('/notifications/mark-all-read');
    return response.data;
  },

  // Clear read notifications
  clearRead: async (): Promise<NotificationActionResponse> => {
    const response = await api.post('/notifications/clear-read');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id: number): Promise<NotificationActionResponse> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};