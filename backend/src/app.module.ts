// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CrmModule } from './modules/crm/crm.module';
import { ChatModule } from './modules/chat/chat.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { TimelineModule } from './modules/timeline/timeline.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule global
    }),
    PrismaModule,
    CrmModule,
    ChatModule,
    TicketsModule,
    TimelineModule,
  ],
})
export class AppModule {}