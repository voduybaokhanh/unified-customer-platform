// backend/src/modules/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CrmModule } from '../crm/crm.module';

@Module({
  imports: [CrmModule], // Import CRM để dùng CrmService
  providers: [ChatService, ChatGateway],
  exports: [ChatService], // Export để modules khác có thể dùng
})
export class ChatModule {}