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
  HttpCode,
  HttpStatus,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ConvertChatToTicketDto } from './dto/convert-chat-to-ticket.dto';

@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  /**
   * POST /api/tickets
   * Tạo ticket mới
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTicketDto) {
    const ticket = await this.ticketsService.createTicket(dto);
    return {
      success: true,
      message: 'Tạo ticket thành công',
      data: ticket,
    };
  }

  /**
   * POST /api/tickets/convert-from-chat/:sessionId
   * Convert chat session thành ticket (TÍNH NĂNG QUAN TRỌNG!)
   */
  @Post('convert-from-chat/:sessionId')
  @HttpCode(HttpStatus.CREATED)
  async convertChatToTicket(
    @Param('sessionId') sessionId: string,
    @Body() dto: ConvertChatToTicketDto,
  ) {
    const ticket = await this.ticketsService.convertChatToTicket(sessionId, dto);
    return {
      success: true,
      message: 'Convert chat thành ticket thành công',
      data: ticket,
    };
  }

  /**
   * GET /api/tickets
   * Lấy danh sách tickets với filter
   */
  @Get()
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

  /**
   * GET /api/tickets/number/:ticketNumber
   * Lấy ticket theo ticket number (TK-00001)
   */
  @Get('number/:ticketNumber')
  async findByNumber(@Param('ticketNumber') ticketNumber: string) {
    const ticket = await this.ticketsService.getTicketByNumber(ticketNumber);
    return {
      success: true,
      data: ticket,
    };
  }

  /**
   * GET /api/tickets/customer/:customerId
   * Lấy tất cả tickets của customer
   */
  @Get('customer/:customerId')
  async findByCustomer(@Param('customerId') customerId: string) {
    const tickets = await this.ticketsService.getCustomerTickets(customerId);
    return {
      success: true,
      data: tickets,
      total: tickets.length,
    };
  }

  /**
   * GET /api/tickets/:id
   * Lấy chi tiết ticket theo ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const ticket = await this.ticketsService.getTicketById(id);
    return {
      success: true,
      data: ticket,
    };
  }

  /**
   * PUT /api/tickets/:id
   * Cập nhật ticket
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    const ticket = await this.ticketsService.updateTicket(id, dto);
    return {
      success: true,
      message: 'Cập nhật ticket thành công',
      data: ticket,
    };
  }

  /**
   * POST /api/tickets/:id/comments
   * Thêm comment vào ticket
   */
  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  async addComment(@Param('id') id: string, @Body() dto: CreateCommentDto) {
    const comment = await this.ticketsService.addComment(id, dto);
    return {
      success: true,
      message: 'Thêm comment thành công',
      data: comment,
    };
  }

  /**
   * GET /api/tickets/:id/comments
   * Lấy danh sách comments của ticket
   */
  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    const comments = await this.ticketsService.getComments(id);
    return {
      success: true,
      data: comments,
      total: comments.length,
    };
  }

  /**
   * DELETE /api/tickets/:id
   * Xóa ticket (soft delete - chuyển sang closed)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.ticketsService.deleteTicket(id);
  }
}