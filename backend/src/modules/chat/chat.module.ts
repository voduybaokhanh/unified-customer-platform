// backend/src/modules/chat/chat.module.ts
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { CrmModule } from '../crm/crm.module';
import { TimelineModule } from '../timeline/timeline.module'; 

@Module({
  imports: [CrmModule, TimelineModule], // Import CRM và Timeline để dùng CrmService và NotificationsGateway
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService], // Export để modules khác có thể dùng
})
export class ChatModule {}