import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreferenceEntity } from './infrastructure/persistence/relational/entities/notification-preference.entity';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    @InjectRepository(NotificationPreferenceEntity)
    private readonly notificationPreferenceRepository: Repository<NotificationPreferenceEntity>,
  ) {}

  async findByUserId(
    userId: string | number,
  ): Promise<NotificationPreferenceEntity> {
    let preference = await this.notificationPreferenceRepository.findOne({
      where: { user: { id: userId as any } },
    });

    // If no preference exists, create default one
    if (!preference) {
      preference = await this.notificationPreferenceRepository.save({
        user: { id: userId as any } as any,
        rateUpdateReminderWhatsApp: true,
        rateUpdateReminderEmail: true,
      });
    }

    return preference!;
  }

  async updateByUserId(
    userId: string | number,
    updateDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceEntity> {
    let preference = await this.notificationPreferenceRepository.findOne({
      where: { user: { id: userId as any } },
    });

    if (!preference) {
      // Create new preference if it doesn't exist
      preference = this.notificationPreferenceRepository.create({
        user: { id: userId as any } as any,
        ...updateDto,
      });
    } else {
      // Update existing preference
      Object.assign(preference, updateDto);
    }

    return await this.notificationPreferenceRepository.save(preference);
  }

  async getMyPreferences(
    userJwtPayload: JwtPayloadType,
  ): Promise<NotificationPreferenceEntity> {
    return this.findByUserId(userJwtPayload.id);
  }

  async updateMyPreferences(
    userJwtPayload: JwtPayloadType,
    updateDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceEntity> {
    return this.updateByUserId(userJwtPayload.id, updateDto);
  }
}
