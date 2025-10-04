// backend/src/modules/chat/chat.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CrmService } from '../crm/crm.service';
import { StartChatDto } from './dto/start-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { ChatSession, ChatMessage, Customer } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private crmService: CrmService,
  ) {}

  /**
   * Bắt đầu chat session mới
   * Tự động lookup/create customer từ email
   */
  async startChatSession(dto: StartChatDto): Promise<{
    session: ChatSession;
    customer: Customer;
    isNewCustomer: boolean;
  }> {
    // 1. Tìm hoặc tạo customer
    let customer = await this.crmService.findByEmail(dto.customerEmail);
    let isNewCustomer = false;

    if (!customer) {
      // Tạo customer mới nếu chưa tồn tại
      customer = await this.crmService.createCustomer({
        email: dto.customerEmail,
        name: dto.customerName,
      });
      isNewCustomer = true;
    }

    // 2. Tạo chat session
    const session = await this.prisma.chatSession.create({
      data: {
        customerId: customer.id,
        status: 'active',
      },
    });

    // 3. Ghi log vào customer activity
    await this.prisma.customerActivity.create({
      data: {
        customerId: customer.id,
        activityType: 'chat',
        referenceId: session.id,
        description: `Bắt đầu chat session`,
      },
    });

    return { session, customer, isNewCustomer };
  }

  /**
   * Lấy thông tin chat session
   */
  async getChatSession(sessionId: string): Promise<ChatSession> {
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        customer: true,
      },
    });

    if (!session) {
      throw new NotFoundException(`Session ${sessionId} không tồn tại`);
    }

    return session;
  }

  /**
   * Lấy lịch sử chat của một session
   */
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    // Kiểm tra session tồn tại
    await this.getChatSession(sessionId);

    return this.prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { sentAt: 'asc' },
    });
  }

  /**
   * Lưu tin nhắn vào database
   */
  async saveMessage(dto: SendMessageDto): Promise<ChatMessage> {
    // Validate session
    const session = await this.getChatSession(dto.sessionId);

    if (session.status !== 'active') {
      throw new BadRequestException('Chat session đã đóng');
    }

    // Lưu message
    const message = await this.prisma.chatMessage.create({
      data: {
        sessionId: dto.sessionId,
        senderType: dto.senderType,
        senderId: dto.senderId,
        content: dto.content,
      },
    });

    return message;
  }

  /**
   * Đóng chat session
   */
  async closeSession(sessionId: string): Promise<ChatSession> {
    const session = await this.getChatSession(sessionId);

    const updatedSession = await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: {
        status: 'closed',
        endedAt: new Date(),
      },
    });

    // Ghi log activity
    await this.prisma.customerActivity.create({
      data: {
        customerId: session.customerId,
        activityType: 'chat',
        referenceId: sessionId,
        description: `Kết thúc chat session`,
      },
    });

    return updatedSession;
  }

  /**
   * Lấy tất cả active sessions (cho agent dashboard)
   */
  async getActiveSessions(): Promise<ChatSession[]> {
    return this.prisma.chatSession.findMany({
      where: { status: 'active' },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  /**
   * Assign agent vào session
   */
  async assignAgent(sessionId: string, agentId: string): Promise<ChatSession> {
    await this.getChatSession(sessionId);

    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { agentId },
    });
  }
}