// backend/src/modules/tickets/dto/create-ticket.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsIn, IsUUID, MinLength, MaxLength } from 'class-validator';

export class CreateTicketDto {
  @IsUUID()
  @IsNotEmpty({ message: 'Customer ID không được để trống' })
  customerId: string;

  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @MinLength(5, { message: 'Tiêu đề phải có ít nhất 5 ký tự' })
  @MaxLength(200, { message: 'Tiêu đề không được quá 200 ký tự' })
  subject: string;

  @IsString()
  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @MinLength(10, { message: 'Mô tả phải có ít nhất 10 ký tự' })
  description: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'], { 
    message: 'Priority phải là: low, medium, high, urgent' 
  })
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @IsOptional()
  @IsUUID()
  chatSessionId?: string;

  @IsOptional()
  @IsUUID()
  assignedTo?: string;
}




