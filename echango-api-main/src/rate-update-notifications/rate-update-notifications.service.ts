import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OfficeEntity } from '../offices/infrastructure/persistence/relational/entities/office.entity';
import { RateHistoryEntity } from '../rate-histories/infrastructure/persistence/relational/entities/rate-history.entity';
import { UltraMsgService } from '../ultramsg/ultramsg.service';
import { MailService } from '../mail/mail.service';
import { NotificationPreferenceEntity } from '../notification-preferences/infrastructure/persistence/relational/entities/notification-preference.entity';

@Injectable()
export class RateUpdateNotificationsService {
  private readonly logger = new Logger(RateUpdateNotificationsService.name);

  constructor(
    @InjectRepository(OfficeEntity)
    private readonly officeRepository: Repository<OfficeEntity>,
    @InjectRepository(RateHistoryEntity)
    private readonly rateHistoryRepository: Repository<RateHistoryEntity>,
    @InjectRepository(NotificationPreferenceEntity)
    private readonly notificationPreferenceRepository: Repository<NotificationPreferenceEntity>,
    private readonly ultraMsgService: UltraMsgService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkAndNotifyInactiveOffices() {
    this.logger.log('Starting daily check for offices with outdated rates...');

    try {
      const officesWithoutRecentUpdates =
        await this.getOfficesWithoutRecentRateUpdates();

      this.logger.log(
        `Found ${officesWithoutRecentUpdates.length} offices without recent rate updates`,
      );

      for (const office of officesWithoutRecentUpdates) {
        await this.sendRateUpdateReminder(office);
      }

      this.logger.log('Completed daily rate update reminder check');
    } catch (error) {
      this.logger.error('Error during daily rate update check:', error);
    }
  }

  private async getOfficesWithoutRecentRateUpdates(): Promise<OfficeEntity[]> {
    // Get date 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Get all active offices
    const allActiveOffices = await this.officeRepository.find({
      where: {
        isActive: true,
        isVerified: true,
      },
      relations: ['owner'],
    });

    const officesWithoutRecentUpdates: OfficeEntity[] = [];

    for (const office of allActiveOffices) {
      // Check if office has any rate history records in the last 24 hours
      const recentRateHistory = await this.rateHistoryRepository.findOne({
        where: {
          office: { id: office.id },
          createdAt: MoreThan(twentyFourHoursAgo),
        },
        order: { createdAt: 'DESC' },
      });

      if (!recentRateHistory) {
        officesWithoutRecentUpdates.push(office);
      }
    }

    return officesWithoutRecentUpdates;
  }

  private async sendRateUpdateReminder(office: OfficeEntity) {
    try {
      // Get user notification preferences
      const notificationPreference =
        await this.notificationPreferenceRepository.findOne({
          where: { user: { id: office.owner.id } },
        });

      // If no preferences found, create default ones (enabled)
      const preferences = notificationPreference || {
        rateUpdateReminderWhatsApp: true,
        rateUpdateReminderEmail: true,
      };

      // Send WhatsApp notification if enabled
      if (preferences.rateUpdateReminderWhatsApp) {
        await this.sendWhatsAppReminder(office);
      }

      // Send email notification if enabled
      if (preferences.rateUpdateReminderEmail) {
        await this.sendEmailReminder(office);
      }

      this.logger.log(
        `Rate update reminder sent for office: ${office.officeName}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send reminder for office ${office.officeName}:`,
        error,
      );
    }
  }

  private async sendWhatsAppReminder(office: OfficeEntity) {
    try {
      if (!office.whatsappNumber) {
        this.logger.warn(
          `No WhatsApp number found for office: ${office.officeName}`,
        );
        return;
      }

      const message = this.buildWhatsAppMessage(office);
      const formattedNumber = this.ultraMsgService.formatPhoneNumber(
        office.whatsappNumber,
      );

      await this.ultraMsgService.sendMessage(formattedNumber, message);

      this.logger.log(
        `WhatsApp reminder sent to ${office.whatsappNumber} for office: ${office.officeName}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send WhatsApp reminder for office ${office.officeName}:`,
        error,
      );
    }
  }

  private async sendEmailReminder(office: OfficeEntity) {
    try {
      if (!office.owner.email) {
        this.logger.warn(
          `No email found for office owner: ${office.officeName}`,
        );
        return;
      }

      // You'll need to create this email template in your mail service
      await this.mailService.rateUpdateReminder({
        to: office.owner.email,
        data: {
          officeName: office.officeName,
          ownerName: `${office.owner.firstName} ${office.owner.lastName}`,
        },
      });

      this.logger.log(
        `Email reminder sent to ${office.owner.email} for office: ${office.officeName}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email reminder for office ${office.officeName}:`,
        error,
      );
    }
  }

  private buildWhatsAppMessage(office: OfficeEntity): string {
    return `🔔 *Rate Update Reminder*

Hello ${office.owner.firstName},

Your exchange office "*${office.officeName}*" hasn't updated its exchange rates in the last 24 hours.

To keep your rates competitive and attract more customers, please update your rates regularly.

💡 *Why update rates regularly?*
• Stay competitive in the market
• Attract more customers
• Improve your office ranking
• Increase visibility on ExchanGo24

Update your rates now: https://exchango24.com/dashboard/rates

Thank you for using ExchanGo24! 🚀

---
*ExchanGo24 Team*`;
  }

  // Manual trigger for testing
  async triggerRateUpdateCheck() {
    this.logger.log('Manually triggering rate update check...');
    await this.checkAndNotifyInactiveOffices();
  }
}
