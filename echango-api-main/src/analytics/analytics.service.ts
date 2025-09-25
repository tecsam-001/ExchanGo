import {
  // common
  Injectable,
  HttpStatus,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ProfileViewsService } from '../profile-views/profile-views.service';
import { GpsClicksService } from '../gps-clicks/gps-clicks.service';
import { PhoneCallsService } from '../phone-calls/phone-calls.service';
import { AlertsService } from '../alerts/alerts.service';
import { OfficesService } from '../offices/offices.service';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import { DashboardSummary } from './analytics.interface';
import {
  OfficeActivityListResponse,
  OfficeRatesService,
} from '../office-rates/office-rates.service';
import { GetOfficeActivityParams } from '../office-rates/types';

@Injectable()
export class AnalyticsService {
  constructor(
    // Dependencies here
    private readonly profileViewsService: ProfileViewsService,
    private readonly gpsClicksService: GpsClicksService,
    private readonly phoneCallsService: PhoneCallsService,
    private readonly alertsService: AlertsService,
    private readonly officeService: OfficesService,
    private readonly officeRatesService: OfficeRatesService,
  ) {}

  async getDashboardSummary(
    userId: string,
    period: '7days' | '30days' | '90days' = '7days',
  ): Promise<DashboardSummary> {
    const office = await this.officeService.getUserOffice(userId);
    if (!office) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: 'officeNotFound',
      });
    }

    console.log('office', office);

    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
    const currentPeriodStart = subDays(new Date(), days);
    const previousPeriodStart = subDays(currentPeriodStart, days);
    const previousPeriodEnd = currentPeriodStart;

    if (!office) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: 'officeNotFound',
      });
    }

    try {
      // Get current period data
      const [
        currentProfileViews,
        currentPhoneCalls,
        currentGpsClicks,
        previousProfileViews,
        previousPhoneCalls,
        previousGpsClicks,
        activeAlerts,
        previousActiveAlerts,
        keyStatsData,
        alertFrequencyData,
      ] = await Promise.all([
        this.profileViewsService.getProfileViewsCount(
          office.id,
          currentPeriodStart,
          new Date(),
        ),
        this.phoneCallsService.getPhoneCallsCount(
          office.id,
          currentPeriodStart,
          new Date(),
        ),
        this.gpsClicksService.getGpsClicksCount(
          office.id,
          currentPeriodStart,
          new Date(),
        ),
        this.profileViewsService.getProfileViewsCount(
          office.id,
          previousPeriodStart,
          previousPeriodEnd,
        ),
        this.phoneCallsService.getPhoneCallsCount(
          office.id,
          previousPeriodStart,
          previousPeriodEnd,
        ),
        this.gpsClicksService.getGpsClicksCount(
          office.id,
          previousPeriodStart,
          previousPeriodEnd,
        ),
        this.alertsService.getActiveAlertsCount(office.id),
        this.alertsService.getActiveAlertsCountForPeriod(
          office.id,
          previousPeriodStart,
          previousPeriodEnd,
        ),
        this.getKeyStatsData(office.id, days),
        this.getAlertFrequencyData(office.id, days),
      ]);

      return {
        profileViews: {
          total: currentProfileViews,
          percentageChange: this.calculatePercentageChange(
            currentProfileViews,
            previousProfileViews,
          ),
          changeFromLastMonth: currentProfileViews - previousProfileViews,
        },
        phoneCalls: {
          total: currentPhoneCalls,
          percentageChange: this.calculatePercentageChange(
            currentPhoneCalls,
            previousPhoneCalls,
          ),
          changeFromLastMonth: currentPhoneCalls - previousPhoneCalls,
        },
        gpsClicks: {
          total: currentGpsClicks,
          percentageChange: this.calculatePercentageChange(
            currentGpsClicks,
            previousGpsClicks,
          ),
          changeFromLastMonth: currentGpsClicks - previousGpsClicks,
        },
        waAlertPrice: {
          total: activeAlerts,
          percentageChange: this.calculatePercentageChange(
            activeAlerts,
            previousActiveAlerts,
          ),
        },
        rateAlertFrequency: this.formatAlertFrequency(alertFrequencyData),
        keyStats: keyStatsData,
        lastUpdate: new Date(),
      };
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          analytics: 'failedToRetrieveAnalytics',
        },
      });
    }
  }

  async getDashboardSummaryForAllOffices(
    period: '7days' | '30days' | '90days' = '7days',
  ): Promise<Partial<DashboardSummary>> {
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
    const currentPeriodStart = subDays(new Date(), days);
    const previousPeriodStart = subDays(currentPeriodStart, days);
    const previousPeriodEnd = currentPeriodStart;

    try {
      const [
        currentProfileViews,
        currentPhoneCalls,
        currentGpsClicks,
        previousProfileViews,
        previousPhoneCalls,
        previousGpsClicks,
        activeAlerts,
        previousActiveAlerts,
      ] = await Promise.all([
        this.profileViewsService.getProfileViewsCountForAllOffices(
          currentPeriodStart,
          new Date(),
        ),
        this.phoneCallsService.getPhoneCallsCountForAllOffices(
          currentPeriodStart,
          new Date(),
        ),
        this.gpsClicksService.getGpsClicksCountForAllOffices(
          currentPeriodStart,
          new Date(),
        ),
        this.profileViewsService.getProfileViewsCountForAllOffices(
          previousPeriodStart,
          previousPeriodEnd,
        ),
        this.phoneCallsService.getPhoneCallsCountForAllOffices(
          previousPeriodStart,
          previousPeriodEnd,
        ),
        this.gpsClicksService.getGpsClicksCountForAllOffices(
          previousPeriodStart,
          previousPeriodEnd,
        ),
        this.alertsService.getActiveAlertsCountForAllOffices(
          previousPeriodStart,
          previousPeriodEnd,
        ),
        this.alertsService.getActiveAlertsCountForPeriodForAllOffices(
          previousPeriodStart,
          previousPeriodEnd,
        ),
      ]);

      return {
        profileViews: {
          total: currentProfileViews,
          percentageChange: this.calculatePercentageChange(
            currentProfileViews,
            previousProfileViews,
          ),
          changeFromLastMonth: currentProfileViews - previousProfileViews,
        },
        phoneCalls: {
          total: currentPhoneCalls,
          percentageChange: this.calculatePercentageChange(
            currentPhoneCalls,
            previousPhoneCalls,
          ),
          changeFromLastMonth: currentPhoneCalls - previousPhoneCalls,
        },
        gpsClicks: {
          total: currentGpsClicks,
          percentageChange: this.calculatePercentageChange(
            currentGpsClicks,
            previousGpsClicks,
          ),
          changeFromLastMonth: currentGpsClicks - previousGpsClicks,
        },
        waAlertPrice: {
          total: activeAlerts,
          percentageChange: this.calculatePercentageChange(
            activeAlerts,
            previousActiveAlerts,
          ),
        },
        lastUpdate: new Date(),
      };
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          analytics: 'failedToRetrieveAnalytics',
        },
      });
    }
  }

  private async getKeyStatsData(
    officeId: string,
    days: number,
  ): Promise<Array<{ day: string; value: number }>> {
    if (!officeId) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          officeId: 'officeIdRequired',
        },
      });
    }

    try {
      const results: Array<{ day: string; value: number }> = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const startOfDayDate = startOfDay(date);
        const endOfDayDate = endOfDay(date);

        const profileViews =
          await this.profileViewsService.getProfileViewsCount(
            officeId,
            startOfDayDate,
            endOfDayDate,
          );

        results.push({
          day: format(date, 'EEE'), // Mon, Tue, Wed, etc.
          value: profileViews,
        });
      }

      return results;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          keyStats: 'failedToRetrieveKeyStats',
        },
      });
    }
  }

  private async getKeyStatsDataForAllOffices(
    days: number,
  ): Promise<Array<{ day: string; value: number }>> {
    if (!days) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          days: 'daysRequired',
        },
      });
    }

    try {
      const results: Array<{ day: string; value: number }> = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const startOfDayDate = startOfDay(date);
        const endOfDayDate = endOfDay(date);

        const profileViews =
          await this.profileViewsService.getProfileViewsCountForAllOffices(
            startOfDayDate,
            endOfDayDate,
          );

        results.push({
          day: format(date, 'EEE'), // Mon, Tue, Wed, etc.
          value: profileViews,
        });
      }

      return results;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          keyStats: 'failedToRetrieveKeyStats',
        },
      });
    }
  }

  private async getAlertFrequencyData(
    officeId: string,
    days: number,
  ): Promise<number> {
    if (!officeId) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          officeId: 'officeIdRequired',
        },
      });
    }

    try {
      const currentPeriodStart = subDays(new Date(), days);
      const alertsCreatedInPeriod =
        await this.alertsService.getAlertsCreatedCount(
          officeId,
          currentPeriodStart,
          new Date(),
        );

      // Calculate frequency as alerts per day
      return alertsCreatedInPeriod / days;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          alertFrequency: 'failedToRetrieveAlertFrequency',
        },
      });
    }
  }

  private async getAlertFrequencyDataForAllOffices(
    days: number,
  ): Promise<number> {
    if (!days) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          days: 'daysRequired',
        },
      });
    }

    try {
      const currentPeriodStart = subDays(new Date(), days);
      const alertsCreatedInPeriod =
        await this.alertsService.getAlertsCreatedCountForAllOffices(
          currentPeriodStart,
          new Date(),
        );

      // Calculate frequency as alerts per day
      return alertsCreatedInPeriod / days;
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          alertFrequency: 'failedToRetrieveAlertFrequency',
        },
      });
    }
  }

  private formatAlertFrequency(frequency: number): string {
    if (frequency >= 1) {
      return `${Math.round(frequency)}x`;
    } else if (frequency >= 1 / 7) {
      return `${Math.round(frequency * 7)}x`;
    } else if (frequency >= 1 / 30) {
      return `${Math.round(frequency * 30)}x`;
    } else {
      return '0x';
    }
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  // Track profile view
  async trackProfileView(
    officeId: string,
    viewerId?: string,
    ipAddress?: string,
    userAgent?: string,
    referrer?: string,
  ): Promise<void> {
    if (!officeId) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          officeId: 'officeIdRequired',
        },
      });
    }

    // Verify office exists
    const office = await this.officeService.findById(officeId);

    if (!office) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: 'officeNotFound',
      });
    }

    try {
      await this.profileViewsService.create({
        officeId,
        viewerId,
        ipAddress,
        userAgent,
        referrer,
      });
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          profileView: 'failedToTrackProfileView',
        },
      });
    }
  }

  // Track phone call
  async trackPhoneCall(
    officeId: string,
    phoneNumber: string,
    phoneType: 'PRIMARY' | 'SECONDARY' | 'THIRD' | 'WHATSAPP',
    callerId?: string,
    ipAddress?: string,
  ): Promise<void> {
    if (!officeId) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          officeId: 'officeIdRequired',
        },
      });
    }

    if (!phoneNumber) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          phoneNumber: 'phoneNumberRequired',
        },
      });
    }

    if (!phoneType) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          phoneType: 'phoneTypeRequired',
        },
      });
    }

    // Verify office exists
    const office = await this.officeService.findById(officeId);

    if (!office) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: 'officeNotFound',
      });
    }

    try {
      await this.phoneCallsService.create({
        officeId,
        phoneNumber,
        phoneType,
        callerId,
        ipAddress,
      });
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          phoneCall: 'failedToTrackPhoneCall',
        },
      });
    }
  }

  // Track GPS click
  async trackGpsClick(
    officeId: string,
    userId?: string,
    ipAddress?: string,
  ): Promise<void> {
    if (!officeId) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          officeId: 'officeIdRequired',
        },
      });
    }

    // Verify office exists
    const office = await this.officeService.findById(officeId);

    if (!office) {
      throw new NotFoundException({
        status: HttpStatus.NOT_FOUND,
        error: 'officeNotFound',
      });
    }

    try {
      await this.gpsClicksService.create({
        officeId,
        userId,
        ipAddress,
      });
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          gpsClick: 'failedToTrackGpsClick',
        },
      });
    }
  }

  /**
   * Get activity statistics for dashboard
   */
  async getActivityStatistics(
    period: '7days' | '30days' | '90days' = '7days',
  ): Promise<{
    period: string;
    totalOffices: number;
    activeOffices: number;
    averageUpdates: number;
    distribution: {
      veryActive: { count: number; percentage: number };
      active: { count: number; percentage: number };
      lowActivity: { count: number; percentage: number };
      inactive: { count: number; percentage: number };
    };
  }> {
    return this.officeRatesService.getActivityStatistics(period);
  }

  /**
   * Get office activity data for all offices
   */
  async getOfficeActivityList(
    params: GetOfficeActivityParams = {},
  ): Promise<OfficeActivityListResponse> {
    return this.officeRatesService.getOfficeActivityList(params);
  }
}
