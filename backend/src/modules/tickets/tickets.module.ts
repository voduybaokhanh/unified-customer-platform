import { Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TicketsController } from './tickets.controller';
import { MessagingModule } from '../../messaging/messaging.module';

@Module({
  imports: [MessagingModule],
  providers: [TicketsService],
  controllers: [TicketsController],
  exports: [TicketsService]
})
export class TicketsModule {}
