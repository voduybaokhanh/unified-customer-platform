// backend/src/modules/chat/dto/start-chat.dto.ts
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class StartChatDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  customerEmail: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MinLength(2, { message: 'Tên phải có ít nhất 2 ký tự' })
  customerName: string;
}
