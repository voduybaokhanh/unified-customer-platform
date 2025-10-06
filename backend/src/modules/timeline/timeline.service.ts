// backend/src/modules/timeline/timeline.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface TimelineEvent {
  id: string;
  type: 'chat' | 'ticket_created' | 'ticket_updated' | 'ticket_closed';
  timestamp: Date;
  description: string;
  metadata?: any;
}

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy timeline đầy đủ của customer
   * Tổng hợp từ: customer_activities, chat_sessions, tickets
   */
  async getCustomerTimeline(customerId: string): Promise<TimelineEvent[]> {
    // Verify customer exists
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer không tồn tại');
    }

    // Lấy tất cả activities
    const [activities, chatSessions, tickets] = await Promise.all([
      // 1. Customer activities (đã được log sẵn)
      this.prisma.customerActivity.findMany({
        where: { customerId },
        orderBy: { createdAt: 'desc' },
      }),

      // 2. Chat sessions
      this.prisma.chatSession.findMany({
        where: { customerId },
        include: {
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { startedAt: 'desc' },
      }),

      // 3. Tickets
      this.prisma.ticket.findMany({
        where: { customerId },
        include: {
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Combine và format timeline
    const timeline: TimelineEvent[] = [];

    // Add activities
    activities.forEach((activity) => {
      timeline.push({
        id: activity.id,
        type: activity.activityType as any,
        timestamp: activity.createdAt,
        description: activity.description,
        metadata: {
          referenceId: activity.referenceId,
        },
      });
    });

    // Add chat sessions (nếu chưa có trong activities)
    chatSessions.forEach((session) => {
      // Check xem đã có activity cho session này chưa
      const hasActivity = activities.some(
        (a) => a.referenceId === session.id && a.activityType === 'chat',
      );

      if (!hasActivity) {
        timeline.push({
          id: session.id,
          type: 'chat',
          timestamp: session.startedAt,
          description: `Chat session ${session.status === 'closed' ? 'đã kết thúc' : 'đang hoạt động'} - ${session._count.messages} tin nhắn`,
          metadata: {
            sessionId: session.id,
            status: session.status,
            messageCount: session._count.messages,
          },
        });
      }
    });

    // Add tickets (nếu chưa có trong activities)
    tickets.forEach((ticket) => {
      const hasActivity = activities.some(
        (a) => a.referenceId === ticket.id,
      );

      if (!hasActivity) {
        timeline.push({
          id: ticket.id,
          type: 'ticket_created',
          timestamp: ticket.createdAt,
          description: `Ticket ${ticket.ticketNumber}: ${ticket.subject}`,
          metadata: {
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            status: ticket.status,
            priority: ticket.priority,
            commentCount: ticket._count.comments,
          },
        });
      }
    });

    // Sort by timestamp descending
    timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return timeline;
  }

  /**
   * Lấy chi tiết một sự kiện trong timeline
   */
  async getEventDetails(eventId: string, eventType: string) {
    switch (eventType) {
      case 'chat':
        return this.getChatEventDetails(eventId);
      case 'ticket_created':
      case 'ticket_updated':
      case 'ticket_closed':
        return this.getTicketEventDetails(eventId);
      default:
        return this.prisma.customerActivity.findUnique({
          where: { id: eventId },
        });
    }
  }

  /**
   * Chi tiết chat event
   */
  private async getChatEventDetails(sessionId: string) {
    return this.prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: {
          orderBy: { sentAt: 'asc' },
          take: 50, // Limit để tránh quá nhiều messages
        },
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Chi tiết ticket event
   */
  private async getTicketEventDetails(ticketId: string) {
    return this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        chatSession: {
          select: {
            id: true,
            startedAt: true,
            endedAt: true,
          },
        },
        comments: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  /**
   * Thống kê tổng quan của customer
   */
  async getCustomerStats(customerId: string) {
    const [chatCount, ticketCount, activities] = await Promise.all([
      this.prisma.chatSession.count({
        where: { customerId },
      }),
      this.prisma.ticket.count({
        where: { customerId },
      }),
      this.prisma.customerActivity.count({
        where: { customerId },
      }),
    ]);

    // Ticket stats by status
    const ticketsByStatus = await this.prisma.ticket.groupBy({
      by: ['status'],
      where: { customerId },
      _count: true,
    });

    // Recent activity
    const recentActivity = await this.prisma.customerActivity.findFirst({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      totalChats: chatCount,
      totalTickets: ticketCount,
      totalActivities: activities,
      ticketsByStatus: ticketsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {}),
      lastActivity: recentActivity?.createdAt,
    };
  }

  /**
   * Lấy timeline của nhiều customers (cho dashboard)
   */
  async getRecentTimeline(limit: number = 50) {
    const activities = await this.prisma.customerActivity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
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

    return activities.map((activity) => ({
      id: activity.id,
      type: activity.activityType,
      timestamp: activity.createdAt,
      description: activity.description,
      customer: activity.customer,
      metadata: {
        referenceId: activity.referenceId,
      },
    }));
  }
}