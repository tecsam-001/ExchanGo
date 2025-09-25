import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationPreferencesService } from './notification-preferences.service';
import { NotificationPreferencesController } from './notification-preferences.controller';
import { NotificationPreferenceEntity } from './infrastructure/persistence/relational/entities/notification-preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationPreferenceEntity])],
  controllers: [NotificationPreferencesController],
  providers: [NotificationPreferencesService],
  exports: [NotificationPreferencesService],
})
export class NotificationPreferencesModule {}
