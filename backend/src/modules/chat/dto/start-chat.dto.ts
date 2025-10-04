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

// backend/src/modules/chat/dto/send-message.dto.ts
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

// backend/src/modules/chat/dto/chat-session.dto.ts
export interface ChatSessionDto {
  sessionId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  agentId?: string;
  status: 'active' | 'closed';
  startedAt: Date;
}

// backend/src/modules/chat/dto/chat-message.dto.ts
export interface ChatMessageDto {
  id: string;
  sessionId: string;
  senderType: 'customer' | 'agent';
  senderId: string;
  senderName: string;
  content: string;
  sentAt: Date;
}