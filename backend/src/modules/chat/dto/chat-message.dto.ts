export interface ChatMessageDto {
  id: string;
  sessionId: string;
  senderType: 'customer' | 'agent';
  senderId: string;
  senderName: string;
  content: string;
  sentAt: Date;
}
