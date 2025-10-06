// frontend/src/hooks/useRealtime.ts
import { useEffect, useState } from 'react';
import { socketService } from '../lib/socket';

interface Notification {
  type: 'chat' | 'ticket' | 'system';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

export function useRealtimeNotifications(agentId: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    socketService.connectNotifications(agentId);

    socketService.onNotification((notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
        });
      }
    });

    return () => {
      socketService.disconnect();
    };
  }, [agentId]);

  return { notifications };
}