// backend/src/modules/timeline/timeline.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { TimelineService } from './timeline.service';

@Controller('api/timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  /**
   * GET /api/timeline/customer/:customerId
   * Lấy toàn bộ timeline của customer (360° view)
   */
  @Get('customer/:customerId')
  async getCustomerTimeline(@Param('customerId') customerId: string) {
    const timeline = await this.timelineService.getCustomerTimeline(customerId);
    return {
      success: true,
      data: timeline,
      total: timeline.length,
    };
  }

  /**
   * GET /api/timeline/customer/:customerId/stats
   * Thống kê tổng quan của customer
   */
  @Get('customer/:customerId/stats')
  async getCustomerStats(@Param('customerId') customerId: string) {
    const stats = await this.timelineService.getCustomerStats(customerId);
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * GET /api/timeline/event/:eventId
   * Lấy chi tiết một event trong timeline
   */
  @Get('event/:eventId')
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

  /**
   * GET /api/timeline/recent
   * Lấy timeline gần đây của tất cả customers (cho dashboard)
   */
  @Get('recent')
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