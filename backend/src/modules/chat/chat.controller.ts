// backend/src/modules/chat/chat.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * GET /api/chat/sessions/active
   * Lấy danh sách chat sessions đang active
   */
  @Get('sessions/active')
  async getActiveSessions() {
    const sessions = await this.chatService.getActiveSessions();
    return {
      success: true,
      data: sessions,
      total: sessions.length,
    };
  }

  /**
   * GET /api/chat/sessions/:id
   * Lấy thông tin chi tiết của chat session
   */
  @Get('sessions/:id')
  async getSession(@Param('id') id: string) {
    const session = await this.chatService.getChatSession(id);
    return {
      success: true,
      data: session,
    };
  }

  /**
   * GET /api/chat/sessions/:id/messages
   * Lấy lịch sử chat
   */
  @Get('sessions/:id/messages')
  async getChatHistory(@Param('id') sessionId: string) {
    const messages = await this.chatService.getChatHistory(sessionId);
    return {
      success: true,
      data: messages,
      total: messages.length,
    };
  }

  /**
   * POST /api/chat/sessions/:id/close
   * Đóng chat session
   */
  @Post('sessions/:id/close')
  @HttpCode(HttpStatus.OK)
  async closeSession(@Param('id') sessionId: string) {
    const session = await this.chatService.closeSession(sessionId);
    return {
      success: true,
      message: 'Chat session đã được đóng',
      data: session,
    };
  }

  /**
   * POST /api/chat/sessions/:id/assign
   * Gán agent vào session
   */
  @Post('sessions/:id/assign')
  @HttpCode(HttpStatus.OK)
  async assignAgent(
    @Param('id') sessionId: string,
    @Body() body: { agentId: string },
  ) {
    const session = await this.chatService.assignAgent(
      sessionId,
      body.agentId,
    );
    return {
      success: true,
      message: 'Đã gán agent vào session',
      data: session,
    };
  }
}