import {
  // common
  Injectable,
} from '@nestjs/common';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { GetOfficeActivityParams } from '../office-rates/types';
import { OfficeActivityListResponse } from '../office-rates/office-rates.service';
import { OfficesService } from '../offices/offices.service';
import { AlertsService } from '../alerts/alerts.service';
import { RateHistoriesService } from '../rate-histories/rate-histories.service';
import { ProfileViewsService } from '../profile-views/profile-views.service';
import { PhoneCallsService } from '../phone-calls/phone-calls.service';
import { GpsClicksService } from '../gps-clicks/gps-clicks.service';
import { subDays, differenceInDays } from 'date-fns';
import { AboutOfficesDto, DurationFilter } from './dto/about-offices.dto';
import {
  AboutOfficesResponse,
  AboutOfficeData,
} from './dto/about-offices-response.dto';
import { RequestsService } from '../requests/requests.service';

@Injectable()
export class AdminsService {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly officesService: OfficesService,
    private readonly alertsService: AlertsService,
    private readonly rateHistoriesService: RateHistoriesService,
    private readonly profileViewsService: ProfileViewsService,
    private readonly phoneCallsService: PhoneCallsService,
    private readonly gpsClicksService: GpsClicksService,
    private readonly requestsService: RequestsService,
  ) {}

  async getDashboardSummary(period: '7days' | '30days' | '90days' = '7days') {
    return this.analyticsService.getDashboardSummaryForAllOffices(period);
  }

  async getActivityStatistics(period: '7days' | '30days' | '90days' = '7days') {
    return this.analyticsService.getActivityStatistics(period);
  }

  async getOfficeActivityList(
    params: GetOfficeActivityParams = {},
  ): Promise<OfficeActivityListResponse> {
    return this.analyticsService.getOfficeActivityList(params);
  }

  /**
   * Get dashboard statistics for the 3 main stats cards
   */
  async getDashboardStats(
    period: '7days' | '30days' | '90days' = '7days',
  ): Promise<{
    totalOffices: {
      total: number;
      percentageChange: number;
      changeFromLastPeriod: number;
    };
    updatesThisWeek: {
      total: number;
      percentageChange: number;
      changeFromLastPeriod: number;
    };
    alerts: {
      total: number;
      percentageChange: number;
      changeFromLastPeriod: number;
    };
  }> {
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
    const currentPeriodStart = subDays(new Date(), days);
    const previousPeriodStart = subDays(currentPeriodStart, days);
    const previousPeriodEnd = currentPeriodStart;

    // Get total offices created in current period
    const currentOfficesCount =
      await this.officesService.getOfficesCreatedCount(
        currentPeriodStart,
        new Date(),
      );
    const previousOfficesCount =
      await this.officesService.getOfficesCreatedCount(
        previousPeriodStart,
        previousPeriodEnd,
      );

    // Get rate history records created in current period (updates this week)
    const currentUpdatesCount =
      await this.rateHistoriesService.getRateHistoriesCreatedCount(
        currentPeriodStart,
        new Date(),
      );
    const previousUpdatesCount =
      await this.rateHistoriesService.getRateHistoriesCreatedCount(
        previousPeriodStart,
        previousPeriodEnd,
      );

    // Get alerts created in current period
    const currentAlertsCount =
      await this.alertsService.getAlertsCreatedCountForAllOffices(
        currentPeriodStart,
        new Date(),
      );
    const previousAlertsCount =
      await this.alertsService.getAlertsCreatedCountForAllOffices(
        previousPeriodStart,
        previousPeriodEnd,
      );

    return {
      totalOffices: {
        total: currentOfficesCount,
        percentageChange: this.calculatePercentageChange(
          currentOfficesCount,
          previousOfficesCount,
        ),
        changeFromLastPeriod: currentOfficesCount - previousOfficesCount,
      },
      updatesThisWeek: {
        total: currentUpdatesCount,
        percentageChange: this.calculatePercentageChange(
          currentUpdatesCount,
          previousUpdatesCount,
        ),
        changeFromLastPeriod: currentUpdatesCount - previousUpdatesCount,
      },
      alerts: {
        total: currentAlertsCount,
        percentageChange: this.calculatePercentageChange(
          currentAlertsCount,
          previousAlertsCount,
        ),
        changeFromLastPeriod: currentAlertsCount - previousAlertsCount,
      },
    };
  }

  /**
   * Get office engagement data for the Office Engagement table
   */
  async getOfficeEngagement(
    params: GetOfficeActivityParams & { search?: string } = {},
  ): Promise<{
    data: Array<{
      office: {
        id: string;
        officeName: string;
        city?: { name: string };
        country?: { name: string };
      };
      profileViews: number;
      phoneCalls: number;
      gpsClicks: number;
    }>;
    period: string;
    totalOffices: number;
    filteredCount: number;
    searchApplied: boolean;
    appliedFilters: {
      period: string;
      cities: string[];
      search?: string;
      isActiveOnly?: boolean;
    };
  }> {
    const { period = '7days', search, cityIds, ...otherParams } = params;
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
    const startDate = subDays(new Date(), days);
    const endDate = new Date();

    let baseResult: any;
    let totalCount: number;
    const searchApplied = !!search;

    if (search) {
      // Get all offices first, then filter by search
      const allOfficesResult =
        await this.analyticsService.getOfficeActivityList({
          period,
          limit: 10000, // Get all offices
        });

      // Filter by search term (office name or city name)
      const filteredOffices = allOfficesResult.data.filter((office: any) => {
        const officeName = office.office.officeName?.toLowerCase() || '';
        const cityName = office.office.city?.name?.toLowerCase() || '';
        const searchTerm = search.toLowerCase();
        return officeName.includes(searchTerm) || cityName.includes(searchTerm);
      });

      totalCount = filteredOffices.length;

      // Apply pagination to filtered results
      const { limit, offset } = otherParams;
      const paginatedOffices =
        limit !== undefined && offset !== undefined
          ? filteredOffices.slice(offset, offset + limit)
          : filteredOffices;

      baseResult = {
        ...allOfficesResult,
        data: paginatedOffices,
      };
    } else {
      // No search - use database-level pagination
      baseResult = await this.analyticsService.getOfficeActivityList({
        ...otherParams,
        period,
      });
      totalCount = baseResult.totalOffices;
    }

    // Get office IDs for bulk operations
    const officeIds = baseResult.data.map((office: any) => office.office.id);

    // Get bulk engagement data
    const [profileViewsCounts, phoneCallsCounts, gpsClicksCounts] =
      await Promise.all([
        this.getBulkViewsCounts(officeIds, startDate, endDate),
        this.getBulkPhoneCallsCounts(officeIds, startDate, endDate),
        this.getBulkGpsClicksCounts(officeIds, startDate, endDate),
      ]);

    // Process data with bulk results
    const processedData = baseResult.data.map((officeActivity: any) => {
      const officeId = officeActivity.office.id;

      return {
        office: officeActivity.office,
        profileViews: profileViewsCounts[officeId] || 0,
        phoneCalls: phoneCallsCounts[officeId] || 0,
        gpsClicks: gpsClicksCounts[officeId] || 0,
      };
    });

    return {
      data: processedData,
      period: this.formatPeriod(period),
      totalOffices: totalCount,
      filteredCount: processedData.length,
      searchApplied,
      appliedFilters: {
        period: this.formatPeriod(period),
        cities: cityIds || [],
        search,
        isActiveOnly: otherParams.isActiveOnly,
      },
    };
  }

  /**
   * Get dashboard table data with office metrics for the selected period (optimized)
   */
  async getDashboardTable(
    params: GetOfficeActivityParams & { search?: string } = {},
  ): Promise<{
    data: Array<{
      office: {
        id: string;
        officeName: string;
        city?: { name: string };
        country?: { name: string };
      };
      alertsCount: number;
      viewsCount: number;
      updateRate: string; // Formatted as "X.Xh" (hours since last update)
      rateHistoryCount: number; // Raw count for sorting
    }>;
    period: string;
    totalOffices: number;
    filteredCount: number;
    searchApplied: boolean;
  }> {
    const { period = '7days', search, ...otherParams } = params;
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;
    const startDate = subDays(new Date(), days);
    const endDate = new Date();

    // Handle search and pagination efficiently
    let searchApplied = false;
    let totalCount = 0;
    let baseResult: any;

    if (search && search.trim() !== '') {
      // If search is provided, we need to get all data first to filter
      searchApplied = true;
      baseResult = await this.analyticsService.getOfficeActivityList({
        ...otherParams,
        period,
        limit: 1000, // Get all for search filtering
        offset: 0,
      });

      // Apply search filter
      const searchTerm = search.toLowerCase().trim();
      const filteredOffices = baseResult.data.filter((office: any) => {
        const officeName = office.office.officeName?.toLowerCase() || '';
        const cityName = office.office.city?.name?.toLowerCase() || '';
        const countryName = office.office.country?.name?.toLowerCase() || '';

        return (
          officeName.includes(searchTerm) ||
          cityName.includes(searchTerm) ||
          countryName.includes(searchTerm)
        );
      });

      totalCount = filteredOffices.length;

      // Apply pagination to filtered results
      const { limit, offset } = otherParams;
      const paginatedOffices =
        limit !== undefined && offset !== undefined
          ? filteredOffices.slice(offset, offset + limit)
          : filteredOffices;

      baseResult = {
        ...baseResult,
        data: paginatedOffices,
      };
    } else {
      // No search - use database-level pagination
      baseResult = await this.analyticsService.getOfficeActivityList({
        ...otherParams,
        period,
      });
      totalCount = baseResult.totalOffices;
    }

    // Extract office IDs for bulk queries (only for the paginated results)
    const officeIds = baseResult.data.map((office: any) => office.office.id);

    if (officeIds.length === 0) {
      return {
        data: [],
        period: this.formatPeriod(period),
        totalOffices: totalCount,
        filteredCount: 0,
        searchApplied,
      };
    }

    // Execute bulk queries only for the offices we're actually displaying
    const [alertsCounts, viewsCounts, rateHistoryCounts] = await Promise.all([
      this.getBulkAlertsCounts(officeIds, startDate, endDate),
      this.getBulkViewsCounts(officeIds, startDate, endDate),
      this.getBulkRateHistoryCounts(officeIds, startDate, endDate),
    ]);

    // Process data with bulk results
    const processedData = baseResult.data.map((officeActivity: any) => {
      const officeId = officeActivity.office.id;

      return {
        office: officeActivity.office,
        alertsCount: alertsCounts[officeId] || 0,
        viewsCount: viewsCounts[officeId] || 0,
        updateRate: this.formatTimeSinceLastUpdate(officeActivity.lastUpdate),
        rateHistoryCount: rateHistoryCounts[officeId] || 0,
      };
    });

    return {
      data: processedData,
      period: this.formatPeriod(period),
      totalOffices: totalCount,
      filteredCount: processedData.length,
      searchApplied,
    };
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return Math.round(((current - previous) / previous) * 100);
  }

  /**
   * Get alerts counts for multiple offices in bulk (optimized)
   */
  private async getBulkAlertsCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    try {
      return await this.alertsService.getBulkAlertsCreatedCounts(
        officeIds,
        startDate,
        endDate,
      );
    } catch {
      // Return empty object on error, individual offices will get 0
      return {};
    }
  }

  /**
   * Get profile views counts for multiple offices in bulk (optimized)
   */
  private async getBulkViewsCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    try {
      return await this.profileViewsService.getBulkProfileViewsCounts(
        officeIds,
        startDate,
        endDate,
      );
    } catch {
      // Return empty object on error, individual offices will get 0
      return {};
    }
  }

  /**
   * Get phone calls counts for multiple offices in bulk (optimized)
   */
  private async getBulkPhoneCallsCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    try {
      return await this.phoneCallsService.getBulkPhoneCallsCounts(
        officeIds,
        startDate,
        endDate,
      );
    } catch {
      // Return empty object on error, individual offices will get 0
      return {};
    }
  }

  /**
   * Get GPS clicks counts for multiple offices in bulk (optimized)
   */
  private async getBulkGpsClicksCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    try {
      return await this.gpsClicksService.getBulkGpsClicksCounts(
        officeIds,
        startDate,
        endDate,
      );
    } catch {
      // Return empty object on error, individual offices will get 0
      return {};
    }
  }

  /**
   * Get rate history counts for multiple offices in bulk (optimized)
   */
  private async getBulkRateHistoryCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    try {
      return await this.rateHistoriesService.getBulkRateHistoriesCounts(
        officeIds,
        startDate,
        endDate,
      );
    } catch {
      // Return empty object on error, individual offices will get 0
      return {};
    }
  }

  /**
   * Format time since last update as "X.Xh" format
   */
  private formatTimeSinceLastUpdate(lastUpdate: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(lastUpdate).getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours.toFixed(1)}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  }

  /**
   * Format period string for display
   */
  private formatPeriod(period: '7days' | '30days' | '90days'): string {
    switch (period) {
      case '7days':
        return 'Last 7 days';
      case '30days':
        return 'Last 30 days';
      case '90days':
        return 'Last 90 days';
      default:
        return 'Last 7 days';
    }
  }

  /**
   * Get comprehensive office information with filtering capabilities
   */
  async getAboutOffices(
    params: AboutOfficesDto,
  ): Promise<AboutOfficesResponse> {
    const {
      countryId,
      cityIds,
      status,
      duration,
      page = 1,
      limit = 10,
      search,
    } = params;

    // Calculate date range based on duration filter
    let startDate: Date | undefined;
    const endDate = new Date();

    if (duration && duration !== DurationFilter.ALL_TIME) {
      switch (duration) {
        case DurationFilter.LAST_7_DAYS:
          startDate = subDays(endDate, 7);
          break;
        case DurationFilter.LAST_1_MONTH:
          startDate = subDays(endDate, 30);
          break;
        case DurationFilter.LAST_6_MONTHS:
          startDate = subDays(endDate, 180);
          break;
      }
    }

    // Get all offices with basic filtering
    const allOffices = await this.officesService.findAllWithPagination({
      paginationOptions: { page: 1, limit: 10000 }, // Get all offices for filtering
    });

    // Get all requests to determine office status
    const allRequests = await this.requestsService.findAllWithPagination({
      paginationOptions: { page: 1, limit: 10000 }, // Get all requests
    });

    // Create a map of office ID to request status
    const officeStatusMap = new Map<string, string>();
    allRequests.forEach((request) => {
      if (request.office?.id) {
        officeStatusMap.set(request.office.id, request.status);
      }
    });

    // Process and filter offices
    const filteredOffices = allOffices
      .filter((office) => {
        // Filter by country ID
        if (countryId && office.country?.id !== countryId) {
          return false;
        }

        // Filter by city IDs
        if (cityIds) {
          const cityIdArray = cityIds.split(',').map((id) => id.trim());
          if (!office.city?.id || !cityIdArray.includes(office.city.id)) {
            return false;
          }
        }

        // Filter by duration (registration date)
        if (startDate && new Date(office.createdAt) < startDate) {
          return false;
        }

        return true;
      })
      .map((office): AboutOfficeData => {
        const officeStatus = officeStatusMap.get(office.id) || 'ACCEPTED';
        const durationDays = differenceInDays(
          endDate,
          new Date(office.createdAt),
        );

        return {
          officeName: office.officeName,
          city: office.city?.name || 'Unknown',
          country: office.country?.name || 'Unknown',
          registrationDate: office.createdAt,
          status: officeStatus,
          duration: durationDays,
        };
      })
      .filter((office) => {
        // Filter by status
        if (status && office.status !== status) {
          return false;
        }

        // Filter by search term
        if (search) {
          const searchTerm = search.toLowerCase();
          const officeName = office.officeName.toLowerCase();
          const cityName = office.city.toLowerCase();
          if (
            !officeName.includes(searchTerm) &&
            !cityName.includes(searchTerm)
          ) {
            return false;
          }
        }

        return true;
      });

    const totalOffices = filteredOffices.length;

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedOffices = filteredOffices.slice(offset, offset + limit);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalOffices / limit);

    return {
      data: paginatedOffices,
      totalOffices,
      filteredCount: paginatedOffices.length,
      appliedFilters: {
        countryId,
        cityIds: cityIds
          ? cityIds.split(',').map((id) => id.trim())
          : undefined,
        status,
        duration,
        search,
      },
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalPages,
        totalItems: totalOffices,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
