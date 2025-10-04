// backend/src/modules/chat/dto/send-message.dto.ts
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Session ID không được để trống' })
  sessionId: string;

  @IsString()
  @IsNotEmpty({ message: 'Nội dung tin nhắn không được để trống' })
  content: string;

  @IsString()
  @IsNotEmpty()
  senderType: 'customer' | 'agent';

  @IsString()
  @IsNotEmpty()
  senderId: string;
}