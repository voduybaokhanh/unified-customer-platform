// backend/src/modules/tickets/dto/convert-chat-to-ticket.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsIn, MinLength } from 'class-validator';

export class ConvertChatToTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề ticket không được để trống' })
  @MinLength(5, { message: 'Tiêu đề phải có ít nhất 5 ký tự' })
  subject: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @IsOptional()
  @IsString()
  assignedTo?: string;
}