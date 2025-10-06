import { Module } from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';

@Module({
  providers: [TimelineService],
  controllers: [TimelineController]
})
export class TimelineModule {}
