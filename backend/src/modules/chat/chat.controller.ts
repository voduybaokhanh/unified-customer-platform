// backend/src/modules/chat/chat.controller.ts
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ChatService } from './chat.service';

@Controller('api/chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('sessions/active')
  @Roles('admin', 'agent')
  async getActiveSessions() {
    const sessions = await this.chatService.getActiveSessions();
    return {
      success: true,
      data: sessions,
      total: sessions.length,
    };
  }

  @Get('sessions/:id')
  @Roles('admin', 'agent')
  async getSession(@Param('id') id: string) {
    const session = await this.chatService.getChatSession(id);
    return {
      success: true,
      data: session,
    };
  }

  @Get('sessions/:id/messages')
  @Roles('admin', 'agent')
  async getChatHistory(@Param('id') sessionId: string) {
    const messages = await this.chatService.getChatHistory(sessionId);
    return {
      success: true,
      data: messages,
      total: messages.length,
    };
  }

  @Post('sessions/:id/close')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'agent')
  async closeSession(@Param('id') sessionId: string) {
    const session = await this.chatService.closeSession(sessionId);
    return {
      success: true,
      message: 'Chat session đã được đóng',
      data: session,
    };
  }

  @Post('sessions/:id/assign')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'agent')
  async assignAgent(
    @Param('id') sessionId: string,
    @Body() body: { agentId: string },
  ) {
    const session = await this.chatService.assignAgent(sessionId, body.agentId);
    return {
      success: true,
      message: 'Đã gán agent vào session',
      data: session,
    };
  }
}