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
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CrmService } from './crm.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('api/customers')
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ Tất cả endpoints cần auth
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post()
  @Roles('admin', 'agent')
  async create(@Body() dto: CreateCustomerDto, @CurrentUser() user: any) {
    const customer = await this.crmService.createCustomer(dto);
    return {
      success: true,
      message: 'Tạo khách hàng thành công',
      data: customer,
    };
  }

  @Get()
  @Roles('admin', 'agent')
  async findAll(@Query('page') page: number, @Query('limit') limit: number) {
    const result = await this.crmService.getCustomers(page, limit);
    return {
      success: true,
      ...result,
    };
  }

  @Get('email/:email')
  @Roles('admin', 'agent')
  async findByEmail(@Param('email') email: string) {
    const customer = await this.crmService.findByEmail(email);
    return {
      success: true,
      data: customer,
    };
  }

  @Get(':id')
  @Roles('admin', 'agent')
  async findOne(@Param('id') id: string) {
    const customer = await this.crmService.getCustomerById(id);
    return {
      success: true,
      data: customer,
    };
  }

  @Put(':id')
  @Roles('admin', 'agent')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    const customer = await this.crmService.updateCustomer(id, dto);
    return {
      success: true,
      message: 'Cập nhật thành công',
      data: customer,
    };
  }

  @Delete(':id')
  @Roles('admin') // Chỉ admin mới xóa
  async remove(@Param('id') id: string) {
    await this.crmService.deleteCustomer(id);
    return {
      success: true,
      message: 'Xóa thành công',
    };
  }
}