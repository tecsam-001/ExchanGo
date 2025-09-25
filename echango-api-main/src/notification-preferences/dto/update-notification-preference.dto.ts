import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferenceDto {
  @ApiPropertyOptional({
    description: 'Enable WhatsApp notifications for rate update reminders',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  rateUpdateReminderWhatsApp?: boolean;

  @ApiPropertyOptional({
    description: 'Enable email notifications for rate update reminders',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  rateUpdateReminderEmail?: boolean;
}
