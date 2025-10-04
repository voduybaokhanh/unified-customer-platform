export interface ChatSessionDto {
  sessionId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  agentId?: string;
  status: 'active' | 'closed';
  startedAt: Date;
}