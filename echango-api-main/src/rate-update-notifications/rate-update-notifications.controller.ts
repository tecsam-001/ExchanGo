import {
  Controller,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RateUpdateNotificationsService } from './rate-update-notifications.service';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';

@ApiTags('Rate Update Notifications')
@Controller({
  path: 'rate-update-notifications',
  version: '1',
})
export class RateUpdateNotificationsController {
  constructor(
    private readonly rateUpdateNotificationsService: RateUpdateNotificationsService,
  ) {}

  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('trigger-check')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Manually trigger rate update check (Admin only)',
    description:
      'Manually trigger the rate update reminder check for testing purposes',
  })
  async triggerRateUpdateCheck(): Promise<void> {
    await this.rateUpdateNotificationsService.triggerRateUpdateCheck();
  }
}
