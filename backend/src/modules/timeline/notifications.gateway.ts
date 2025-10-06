// backend/src/modules/timeline/notifications.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

export interface Notification {
  type: 'chat' | 'ticket' | 'system';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('NotificationsGateway');
  private agentConnections = new Map<string, string>(); // socketId -> agentId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to notifications: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const agentId = this.agentConnections.get(client.id);
    if (agentId) {
      this.agentConnections.delete(client.id);
      this.logger.log(`Agent ${agentId} disconnected`);
    }
  }

  /**
   * Agent subscribe vào notifications
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { agentId: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.agentConnections.set(client.id, data.agentId);
    client.join('agents');
    
    this.logger.log(`Agent ${data.agentId} subscribed to notifications`);
    
    client.emit('subscribed', {
      success: true,
      message: 'Đã đăng ký nhận thông báo',
    });
  }

  /**
   * Gửi notification cho một agent cụ thể
   */
  notifyAgent(agentId: string, notification: Notification) {
    // Tìm socket của agent
    for (const [socketId, aId] of this.agentConnections.entries()) {
      if (aId === agentId) {
        this.server.to(socketId).emit('notification', notification);
        this.logger.log(`Notification sent to agent ${agentId}`);
        return;
      }
    }
  }

  /**
   * Gửi notification cho tất cả agents
   */
  notifyAllAgents(notification: Notification) {
    this.server.to('agents').emit('notification', notification);
    this.logger.log(`Notification broadcast to all agents`);
  }

  /**
   * Gửi notification cho customer (qua room)
   */
  notifyCustomer(customerId: string, notification: Notification) {
    this.server.to(`customer-${customerId}`).emit('notification', notification);
    this.logger.log(`Notification sent to customer ${customerId}`);
  }

  /**
   * Helper methods để các modules khác có thể gọi
   */

  // Notification khi có chat session mới
  notifyNewChatSession(sessionId: string, customerEmail: string) {
    this.notifyAllAgents({
      type: 'chat',
      title: 'Chat Session Mới',
      message: `Khách hàng ${customerEmail} vừa bắt đầu chat`,
      data: { sessionId, customerEmail },
      timestamp: new Date(),
    });
  }

  // Notification khi ticket được assign
  notifyTicketAssigned(agentId: string, ticketNumber: string, subject: string) {
    this.notifyAgent(agentId, {
      type: 'ticket',
      title: 'Ticket Mới Được Gán',
      message: `Ticket ${ticketNumber}: ${subject}`,
      data: { ticketNumber },
      timestamp: new Date(),
    });
  }

  // Notification khi ticket status thay đổi
  notifyTicketStatusChanged(
    customerId: string,
    ticketNumber: string,
    newStatus: string,
  ) {
    this.notifyCustomer(customerId, {
      type: 'ticket',
      title: 'Cập Nhật Ticket',
      message: `Ticket ${ticketNumber} đã chuyển sang: ${newStatus}`,
      data: { ticketNumber, status: newStatus },
      timestamp: new Date(),
    });
  }

  // Notification khi có comment mới
  notifyNewComment(
    recipientType: 'agent' | 'customer',
    recipientId: string,
    ticketNumber: string,
  ) {
    const notification: Notification = {
      type: 'ticket',
      title: 'Bình Luận Mới',
      message: `Có bình luận mới trên ticket ${ticketNumber}`,
      data: { ticketNumber },
      timestamp: new Date(),
    };

    if (recipientType === 'agent') {
      this.notifyAgent(recipientId, notification);
    } else {
      this.notifyCustomer(recipientId, notification);
    }
  }
}