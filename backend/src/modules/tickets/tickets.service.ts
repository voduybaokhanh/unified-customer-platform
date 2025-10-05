// backend/src/modules/tickets/tickets.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ConvertChatToTicketDto } from './dto/convert-chat-to-ticket.dto';
import { Ticket, TicketComment } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo ticket mới
   */
  async createTicket(dto: CreateTicketDto): Promise<Ticket> {
    // Verify customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer không tồn tại');
    }

    // Verify chat session exists (if provided)
    if (dto.chatSessionId) {
      const session = await this.prisma.chatSession.findUnique({
        where: { id: dto.chatSessionId },
      });

      if (!session) {
        throw new NotFoundException('Chat session không tồn tại');
      }
    }

    // Generate ticket number
    const count = await this.prisma.ticket.count();
    const ticketNumber = `TK-${String(count + 1).padStart(5, '0')}`;

    // Create ticket
    const ticket = await this.prisma.ticket.create({
      data: {
        ticketNumber,
        customerId: dto.customerId,
        chatSessionId: dto.chatSessionId,
        subject: dto.subject,
        description: dto.description,
        priority: dto.priority || 'medium',
        assignedTo: dto.assignedTo,
        status: 'open',
      },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Log activity
    await this.prisma.customerActivity.create({
      data: {
        customerId: dto.customerId,
        activityType: 'ticket_created',
        referenceId: ticket.id,
        description: `Ticket ${ticketNumber} được tạo: ${dto.subject}`,
      },
    });

    return ticket;
  }

  /**
   * Convert chat session thành ticket
   * Đây là tính năng QUAN TRỌNG của hệ thống!
   */
  async convertChatToTicket(
    sessionId: string,
    dto: ConvertChatToTicketDto,
  ): Promise<Ticket> {
    // Lấy chat session và messages
    const session = await this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { sentAt: 'asc' },
        },
        customer: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Chat session không tồn tại');
    }

    // Kiểm tra đã convert chưa
    const existingTicket = await this.prisma.ticket.findFirst({
      where: { chatSessionId: sessionId },
    });

    if (existingTicket) {
      throw new BadRequestException(
        `Chat session đã được convert thành ticket ${existingTicket.ticketNumber}`,
      );
    }

    // Tạo description từ chat history
    let description = `--- Lịch sử chat ---\n\n`;
    session.messages.forEach((msg) => {
      const timestamp = msg.sentAt.toLocaleString('vi-VN');
      const sender = msg.senderType === 'customer' ? 'Khách hàng' : 'Agent';
      description += `[${timestamp}] ${sender}: ${msg.content}\n\n`;
    });

    // Create ticket
    const ticket = await this.createTicket({
      customerId: session.customerId,
      chatSessionId: sessionId,
      subject: dto.subject,
      description,
      priority: dto.priority || 'medium',
      assignedTo: dto.assignedTo ?? (session.agentId ?? undefined),
    });

    // Đóng chat session
    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { status: 'closed', endedAt: new Date() },
    });

    // Log activity riêng cho conversion
    await this.prisma.customerActivity.create({
      data: {
        customerId: session.customerId,
        activityType: 'ticket_created',
        referenceId: ticket.id,
        description: `Chat session được convert thành ticket ${ticket.ticketNumber}`,
      },
    });

    return ticket;
  }

  /**
   * Lấy danh sách tickets với filter
   */
  async getTickets(filters: {
    status?: string;
    priority?: string;
    customerId?: string;
    assignedTo?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, priority, customerId, assignedTo, page = 1, limit = 10 } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (customerId) where.customerId = customerId;
    if (assignedTo) where.assignedTo = assignedTo;

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data: tickets,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy chi tiết ticket
   */
  async getTicketById(id: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        customer: true,
        chatSession: {
          include: {
            messages: {
              orderBy: { sentAt: 'asc' },
            },
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket không tồn tại`);
    }

    return ticket;
  }

  /**
   * Lấy ticket theo ticket number
   */
  async getTicketByNumber(ticketNumber: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { ticketNumber },
      include: {
        customer: true,
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket ${ticketNumber} không tồn tại`);
    }

    return ticket;
  }

  /**
   * Update ticket
   */
  async updateTicket(id: string, dto: UpdateTicketDto): Promise<Ticket> {
    // Verify ticket exists
    const existingTicket = await this.getTicketById(id);

    // Update ticket
    const ticket = await this.prisma.ticket.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.status === 'resolved' && { resolvedAt: new Date() }),
      },
      include: {
        customer: true,
      },
    });

    // Log activity nếu thay đổi status
    if (dto.status && dto.status !== existingTicket.status) {
      await this.prisma.customerActivity.create({
        data: {
          customerId: ticket.customerId,
          activityType: 'ticket_updated',
          referenceId: ticket.id,
          description: `Ticket ${ticket.ticketNumber} chuyển sang trạng thái: ${dto.status}`,
        },
      });
    }

    return ticket;
  }

  /**
   * Thêm comment vào ticket
   */
  async addComment(ticketId: string, dto: CreateCommentDto): Promise<TicketComment> {
    // Verify ticket exists
    await this.getTicketById(ticketId);

    const comment = await this.prisma.ticketComment.create({
      data: {
        ticketId,
        userId: dto.userId,
        comment: dto.comment,
        isInternal: dto.isInternal || false,
      },
    });

    return comment;
  }

  /**
   * Lấy comments của ticket
   */
  async getComments(ticketId: string): Promise<TicketComment[]> {
    await this.getTicketById(ticketId);

    return this.prisma.ticketComment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Delete ticket (soft delete - chuyển status thành closed)
   */
  async deleteTicket(id: string): Promise<void> {
    await this.getTicketById(id);

    await this.prisma.ticket.update({
      where: { id },
      data: { status: 'closed' },
    });
  }

  /**
   * Lấy tickets của customer
   */
  async getCustomerTickets(customerId: string) {
    return this.prisma.ticket.findMany({
      where: { customerId },
      include: {
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}