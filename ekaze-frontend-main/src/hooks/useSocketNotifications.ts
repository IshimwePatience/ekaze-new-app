import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/services/socketService';
import { notificationKeys } from '@/hooks/useNotifications';
import { toast } from 'sonner';

export const useSocketNotifications = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNotification = (notif: any) => {
      // 1. Invalidate queries to fetch fresh notifications immediately
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });

      // 2. Trigger live toast alert
      toast.info(notif.title || 'New Notification', {
        description: notif.message,
        duration: 5000,
      });
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [queryClient]);
};
