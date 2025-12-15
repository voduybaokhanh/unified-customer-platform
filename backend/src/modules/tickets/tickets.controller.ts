// backend/src/modules/tickets/tickets.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/dto/register.dto';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ConvertChatToTicketDto } from './dto/convert-chat-to-ticket.dto';

@Controller('api/tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.AGENT)
  async create(@Body() dto: CreateTicketDto, @CurrentUser() user: any) {
    const ticket = await this.ticketsService.createTicket(dto);
    return {
      success: true,
      message: 'Tạo ticket thành công',
      data: ticket,
      createdBy: user.name,
    };
  }

  @Post('convert-from-chat/:sessionId')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.AGENT)
  async convertChatToTicket(
    @Param('sessionId') sessionId: string,
    @Body() dto: ConvertChatToTicketDto,
    @CurrentUser() user: any,
  ) {
    const ticket = await this.ticketsService.convertChatToTicket(sessionId, dto);
    return {
      success: true,
      message: 'Convert chat thành ticket thành công',
      data: ticket,
      convertedBy: user.name,
    };
  }

  @Get()
  @Roles(Role.ADMIN, Role.AGENT)
  async findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('customerId') customerId?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    const result = await this.ticketsService.getTickets({
      status,
      priority,
      customerId,
      assignedTo,
      page,
      limit,
    });

    return {
      success: true,
      ...result,
    };
  }

  @Get('number/:ticketNumber')
  @Roles(Role.ADMIN, Role.AGENT)
  async findByNumber(@Param('ticketNumber') ticketNumber: string) {
    const ticket = await this.ticketsService.getTicketByNumber(ticketNumber);
    return {
      success: true,
      data: ticket,
    };
  }

  @Get('customer/:customerId')
  @Roles(Role.ADMIN, Role.AGENT)
  async findByCustomer(@Param('customerId') customerId: string) {
    const tickets = await this.ticketsService.getCustomerTickets(customerId);
    return {
      success: true,
      data: tickets,
      total: tickets.length,
    };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.AGENT)
  async findOne(@Param('id') id: string) {
    const ticket = await this.ticketsService.getTicketById(id);
    return {
      success: true,
      data: ticket,
    };
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.AGENT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTicketDto,
    @CurrentUser() user: any,
  ) {
    const ticket = await this.ticketsService.updateTicket(id, dto);
    return {
      success: true,
      message: 'Cập nhật ticket thành công',
      data: ticket,
      updatedBy: user.name,
    };
  }

  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.ADMIN, Role.AGENT)
  async addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    const comment = await this.ticketsService.addComment(id, {
      ...dto,
      userId: user.id, // Override userId với current user
    });
    return {
      success: true,
      message: 'Thêm comment thành công',
      data: comment,
    };
  }

  @Get(':id/comments')
  @Roles(Role.ADMIN, Role.AGENT)
  async getComments(@Param('id') id: string) {
    const comments = await this.ticketsService.getComments(id);
    return {
      success: true,
      data: comments,
      total: comments.length,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN) // Chỉ admin mới xóa được
  async remove(@Param('id') id: string) {
    await this.ticketsService.deleteTicket(id);
  }
}