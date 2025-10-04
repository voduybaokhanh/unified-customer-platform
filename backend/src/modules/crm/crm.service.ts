// backend/src/modules/crm/crm.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from '@prisma/client';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo khách hàng mới
   */
  async createCustomer(dto: CreateCustomerDto): Promise<Customer> {
    // Kiểm tra email đã tồn tại chưa
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { email: dto.email },
    });

    if (existingCustomer) {
      throw new ConflictException(`Email ${dto.email} đã được sử dụng`);
    }

    // Tạo customer mới
    const customer = await this.prisma.customer.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        name: dto.name.trim(),
        phone: dto.phone?.trim(),
        company: dto.company?.trim(),
      },
    });

    return customer;
  }

  /**
   * Lấy thông tin khách hàng theo ID
   */
  async getCustomerById(id: string): Promise<Customer> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Không tìm thấy khách hàng với ID: ${id}`);
    }

    return customer;
  }

  /**
   * Tìm khách hàng theo email (quan trọng cho Live Chat)
   */
  async findByEmail(email: string): Promise<Customer | null> {
    if (!email) {
      throw new BadRequestException('Email không được để trống');
    }

    return this.prisma.customer.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
  }

  /**
   * Lấy danh sách khách hàng với phân trang
   */
  async getCustomers(page: number = 1, limit: number = 10) {
    // Validate pagination params
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;

    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count(),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Cập nhật thông tin khách hàng
   */
  async updateCustomer(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    // Kiểm tra customer có tồn tại không
    await this.getCustomerById(id);

    // Nếu update email, kiểm tra email mới có bị trùng không
    if (dto.email) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });

      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictException(`Email ${dto.email} đã được sử dụng`);
      }
    }

    // Update customer
    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: {
        ...(dto.email && { email: dto.email.toLowerCase().trim() }),
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.phone !== undefined && { phone: dto.phone?.trim() }),
        ...(dto.company !== undefined && { company: dto.company?.trim() }),
      },
    });

    return updatedCustomer;
  }

  /**
   * Xóa khách hàng (soft delete hoặc hard delete tùy requirement)
   */
  async deleteCustomer(id: string): Promise<void> {
    // Kiểm tra customer có tồn tại không
    await this.getCustomerById(id);

    // Check xem customer có data liên quan không
    const [chatSessions, tickets] = await Promise.all([
      this.prisma.chatSession.count({ where: { customerId: id } }),
      this.prisma.ticket.count({ where: { customerId: id } }),
    ]);

    if (chatSessions > 0 || tickets > 0) {
      throw new ConflictException(
        'Không thể xóa khách hàng có lịch sử chat hoặc ticket',
      );
    }

    // Hard delete
    await this.prisma.customer.delete({ where: { id } });
  }
}