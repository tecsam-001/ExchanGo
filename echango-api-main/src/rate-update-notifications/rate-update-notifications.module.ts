import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateUpdateNotificationsService } from './rate-update-notifications.service';
import { RateUpdateNotificationsController } from './rate-update-notifications.controller';
import { OfficeEntity } from '../offices/infrastructure/persistence/relational/entities/office.entity';
import { RateHistoryEntity } from '../rate-histories/infrastructure/persistence/relational/entities/rate-history.entity';
import { NotificationPreferenceEntity } from '../notification-preferences/infrastructure/persistence/relational/entities/notification-preference.entity';
import { UltraMsgModule } from '../ultramsg/ultramsg.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfficeEntity,
      RateHistoryEntity,
      NotificationPreferenceEntity,
    ]),
    UltraMsgModule,
    MailModule,
  ],
  controllers: [RateUpdateNotificationsController],
  providers: [RateUpdateNotificationsService],
  exports: [RateUpdateNotificationsService],
})
export class RateUpdateNotificationsModule {}
