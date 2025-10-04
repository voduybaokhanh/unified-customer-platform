// backend/src/modules/crm/crm.controller.ts
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
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('api/customers')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  /**
   * POST /api/customers
   * Tạo khách hàng mới
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateCustomerDto) {
    const customer = await this.crmService.createCustomer(dto);
    return {
      success: true,
      message: 'Tạo khách hàng thành công',
      data: customer,
    };
  }

  /**
   * GET /api/customers
   * Lấy danh sách khách hàng với phân trang
   */
  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const result = await this.crmService.getCustomers(page, limit);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * GET /api/customers/email/:email
   * Tìm khách hàng theo email (dùng cho Live Chat lookup)
   */
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    const customer = await this.crmService.findByEmail(email);
    return {
      success: true,
      data: customer,
      message: customer
        ? 'Tìm thấy khách hàng'
        : 'Khách hàng chưa tồn tại trong hệ thống',
    };
  }

  /**
   * GET /api/customers/:id
   * Lấy chi tiết khách hàng theo ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const customer = await this.crmService.getCustomerById(id);
    return {
      success: true,
      data: customer,
    };
  }

  /**
   * PUT /api/customers/:id
   * Cập nhật thông tin khách hàng
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const customer = await this.crmService.updateCustomer(id, dto);
    return {
      success: true,
      message: 'Cập nhật khách hàng thành công',
      data: customer,
    };
  }

  /**
   * DELETE /api/customers/:id
   * Xóa khách hàng
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.crmService.deleteCustomer(id);
  }
}