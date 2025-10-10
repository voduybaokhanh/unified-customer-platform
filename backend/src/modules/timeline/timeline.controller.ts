// backend/src/modules/timeline/timeline.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { TimelineService } from './timeline.service';

@Controller('api/timeline')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Get('customer/:customerId')
  @Roles('admin', 'agent')
  async getCustomerTimeline(@Param('customerId') customerId: string) {
    const timeline = await this.timelineService.getCustomerTimeline(customerId);
    return {
      success: true,
      data: timeline,
      total: timeline.length,
    };
  }

  @Get('customer/:customerId/stats')
  @Roles('admin', 'agent')
  async getCustomerStats(@Param('customerId') customerId: string) {
    const stats = await this.timelineService.getCustomerStats(customerId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('event/:eventId')
  @Roles('admin', 'agent')
  async getEventDetails(
    @Param('eventId') eventId: string,
    @Query('type') type: string,
  ) {
    const details = await this.timelineService.getEventDetails(eventId, type);
    return {
      success: true,
      data: details,
    };
  }

  @Get('recent')
  @Roles('admin', 'agent')
  async getRecentTimeline(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const timeline = await this.timelineService.getRecentTimeline(limit);
    return {
      success: true,
      data: timeline,
      total: timeline.length,
    };
  }
}