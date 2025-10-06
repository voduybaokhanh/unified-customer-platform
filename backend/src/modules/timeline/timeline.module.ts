import { Module } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  controllers: [TimelineController],
  providers: [TimelineService, NotificationsGateway],
  exports: [TimelineService, NotificationsGateway],
})
export class TimelineModule {}
