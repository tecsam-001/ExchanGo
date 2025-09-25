import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotificationPreferencesService } from './notification-preferences.service';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { NotificationPreference } from './domain/notification-preference';

@ApiTags('Notification Preferences')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'notification-preferences',
  version: '1',
})
export class NotificationPreferencesController {
  constructor(
    private readonly notificationPreferencesService: NotificationPreferencesService,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get my notification preferences',
    description: 'Get the current user notification preferences',
  })
  @ApiOkResponse({
    type: NotificationPreference,
  })
  @HttpCode(HttpStatus.OK)
  async getMyPreferences(@Request() request): Promise<NotificationPreference> {
    return this.notificationPreferencesService.getMyPreferences(request.user);
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Update my notification preferences',
    description: 'Update the current user notification preferences',
  })
  @ApiOkResponse({
    type: NotificationPreference,
  })
  @HttpCode(HttpStatus.OK)
  async updateMyPreferences(
    @Request() request,
    @Body() updateDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    return this.notificationPreferencesService.updateMyPreferences(
      request.user,
      updateDto,
    );
  }
}
