// backend/src/modules/chat/chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { StartChatDto } from './dto/start-chat.dto';
import { NotificationsGateway } from '../timeline/notifications.gateway';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('ChatGateway');
  private activeSockets = new Map<string, string>(); // socketId -> sessionId
  private messageRateLimit = new Map<string, { count: number; resetTime: number }>(); // Rate limiting for messages

  constructor(
    private chatService: ChatService,
    private notificationsGateway: NotificationsGateway,
  ) { }

  /**
   * Khi client kết nối WebSocket
   */
  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  /**
   * Khi client ngắt kết nối
   */
  handleDisconnect(client: Socket) {
    const sessionId = this.activeSockets.get(client.id);
    if (sessionId) {
      this.activeSockets.delete(client.id);
      this.logger.log(`Client ${client.id} disconnected from session ${sessionId}`);
    }
  }

  /**
   * Customer bắt đầu chat
   * Event: 'startChat'
   */
  @SubscribeMessage('startChat')
  async handleStartChat(
    @MessageBody() dto: StartChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      this.logger.log(`Start chat request from: ${dto.customerEmail}`);

      const { session, customer, isNewCustomer } =
        await this.chatService.startChatSession(dto);

      // Join room theo sessionId
      client.join(session.id);
      this.activeSockets.set(client.id, session.id);

      // Gửi thông tin session về cho customer
      client.emit('chatStarted', {
        sessionId: session.id,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
        },
        isNewCustomer,
        message: isNewCustomer
          ? 'Chào mừng bạn đến với hệ thống!'
          : 'Chào mừng bạn quay lại!',
      });

      // ✅ Gửi notification cho agents
      this.notificationsGateway.notifyNewChatSession(
        session.id,
        customer.email,
      );

      // Thông báo cho agents có customer mới
      this.server.to('agents').emit('newChatSession', {
        sessionId: session.id,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
        },
        startedAt: session.startedAt,
      });

      // Nếu là customer cũ, load lịch sử chat
      if (!isNewCustomer) {
        const history = await this.chatService.getChatHistory(session.id);
        client.emit('chatHistory', history);
      }

      return { success: true, sessionId: session.id };
    } catch (error) {
      this.logger.error(`Start chat error: ${error.message}`);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Gửi tin nhắn
   * Event: 'sendMessage'
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: {
      sessionId: string;
      content: string;
      senderType: 'customer' | 'agent';
      senderId: string;
      senderName: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Rate limiting: 60 messages per minute per sender
      const now = Date.now();
      const rateLimitKey = `${data.senderId}_${data.sessionId}`;
      const rateLimit = this.messageRateLimit.get(rateLimitKey);

      if (rateLimit) {
        if (now < rateLimit.resetTime) {
          if (rateLimit.count >= 60) {
            client.emit('error', {
              message: 'Rate limit exceeded. Maximum 60 messages per minute.',
              code: 'RATE_LIMIT_EXCEEDED'
            });
            return { success: false, error: 'Rate limit exceeded' };
          }
          rateLimit.count++;
        } else {
          this.messageRateLimit.set(rateLimitKey, { count: 1, resetTime: now + 60000 });
        }
      } else {
        this.messageRateLimit.set(rateLimitKey, { count: 1, resetTime: now + 60000 });
      }

      // Lưu message vào database
      const message = await this.chatService.saveMessage({
        sessionId: data.sessionId,
        content: data.content,
        senderType: data.senderType,
        senderId: data.senderId,
      });

      // Broadcast message đến tất cả trong room
      this.server.to(data.sessionId).emit('newMessage', {
        id: message.id,
        sessionId: message.sessionId,
        senderType: message.senderType,
        senderId: message.senderId,
        senderName: data.senderName,
        content: message.content,
        sentAt: message.sentAt,
      });

      return { success: true, messageId: message.id };
    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      client.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Agent join vào chat session
   * Event: 'joinSession'
   */
  @SubscribeMessage('joinSession')
  async handleJoinSession(
    @MessageBody() data: { sessionId: string; agentId: string; agentName: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // Join room
      client.join(data.sessionId);
      client.join('agents'); // Để nhận thông báo về sessions mới

      // Assign agent vào session
      await this.chatService.assignAgent(data.sessionId, data.agentId);

      // Load chat history
      const history = await this.chatService.getChatHistory(data.sessionId);

      // Thông báo cho customer có agent tham gia
      this.server.to(data.sessionId).emit('agentJoined', {
        agentId: data.agentId,
        agentName: data.agentName,
        message: `${data.agentName} đã tham gia hỗ trợ`,
      });

      return { success: true, history };
    } catch (error) {
      this.logger.error(`Join session error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Đóng chat session
   * Event: 'closeChat'
   */
  @SubscribeMessage('closeChat')
  async handleCloseChat(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.chatService.closeSession(data.sessionId);

      // Thông báo cho tất cả trong room
      this.server.to(data.sessionId).emit('chatClosed', {
        sessionId: data.sessionId,
        message: 'Chat đã kết thúc',
      });

      // Leave room
      this.server.in(data.sessionId).socketsLeave(data.sessionId);

      return { success: true };
    } catch (error) {
      this.logger.error(`Close chat error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Agent đang typing
   * Event: 'typing'
   */
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { sessionId: string; isTyping: boolean; userName: string },
  ) {
    // Broadcast typing status (không lưu database)
    this.server.to(data.sessionId).emit('userTyping', {
      userName: data.userName,
      isTyping: data.isTyping,
    });
  }
}