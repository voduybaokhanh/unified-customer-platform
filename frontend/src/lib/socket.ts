// frontend/src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;
  private notificationSocket: Socket | null = null;

  // Connect to notifications
  connectNotifications(agentId: string) {
    if (this.notificationSocket?.connected) return;

    this.notificationSocket = io(`${SOCKET_URL}/notifications`, {
      transports: ['websocket', 'polling'],
    });

    this.notificationSocket.on('connect', () => {
      console.log('Connected to notifications');
      this.notificationSocket?.emit('subscribe', { agentId });
    });

    this.notificationSocket.on('subscribed', (data) => {
      console.log('Subscribed to notifications:', data);
    });

    return this.notificationSocket;
  }

  // Listen to notification events
  onNotification(callback: (notification: any) => void) {
    this.notificationSocket?.on('notification', callback);
  }

  // Disconnect
  disconnect() {
    this.socket?.disconnect();
    this.notificationSocket?.disconnect();
  }
}

export const socketService = new SocketService();