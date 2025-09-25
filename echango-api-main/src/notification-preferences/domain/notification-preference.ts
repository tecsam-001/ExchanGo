import { ApiProperty } from '@nestjs/swagger';

export class NotificationPreference {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Enable WhatsApp notifications for rate update reminders',
  })
  rateUpdateReminderWhatsApp: boolean;

  @ApiProperty({
    description: 'Enable email notifications for rate update reminders',
  })
  rateUpdateReminderEmail: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
