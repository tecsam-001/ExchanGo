import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackPhoneCallDto } from './dto/track-phone-call.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'analytics',
  version: '1',
})
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}
  @Get('dashboard')
  async getDashboard(
    @Query('period') period: '7days' | '30days' | '90days' = '7days',
    @Req() req: any,
  ) {
    return await this.analyticsService.getDashboardSummary(req.user.id, period);
  }

  @Post('track/profile-view/:officeId')
  async trackProfileView(
    @Param('officeId') officeId: string,
    @Body() trackingData: { viewerId?: string; referrer?: string },
    @Req() req,
  ) {
    const ipAddress = req.ip;
    const userAgent = req.get('User-Agent');

    await this.analyticsService.trackProfileView(
      officeId,
      req.user.id,
      ipAddress,
      userAgent,
    );

    return { success: true };
  }

  @Post('track/phone-call/:officeId')
  async trackPhoneCall(
    @Param('officeId') officeId: string,
    @Body()
    trackingData: TrackPhoneCallDto,
    @Req() req,
  ) {
    const ipAddress = req.ip;

    console.log('Data', {
      officeId,
      phoneNumber: trackingData.phoneNumber,
      phoneType: trackingData.phoneType,
      callerId: req.user.id,
      ipAddress,
    });

    await this.analyticsService.trackPhoneCall(
      officeId,
      trackingData.phoneNumber,
      trackingData.phoneType,
      req.user.id,
      ipAddress,
    );

    return { success: true };
  }

  @Post('track/gps-click/:officeId')
  async trackGpsClick(@Param('officeId') officeId: string, @Req() req) {
    const ipAddress = req.ip;

    await this.analyticsService.trackGpsClick(officeId, req.user.id, ipAddress);

    return { success: true };
  }
}
