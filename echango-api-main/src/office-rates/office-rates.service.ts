import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateOfficeRateDto } from './dto/create-office-rate.dto';
import { UpdateOfficeRateDto } from './dto/update-office-rate.dto';
import { BulkUpdateOfficeRatesDto } from './dto/bulk-update-office-rates.dto';
import { OfficeRateRepository } from './infrastructure/persistence/office-rate.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { OfficeRate } from './domain/office-rate';
import { Currency } from 'src/currencies/domain/currency';
import { Office } from 'src/offices/domain/office';
import { OfficesService } from 'src/offices/offices.service';
import { CurrenciesService } from 'src/currencies/currencies.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RateUpdateEvent } from 'src/events/rate-update.event';
import {
  CityRankingParams,
  CityRankingResult,
  GetOfficeActivityParams,
} from './types';
import { OfficeRateEntity } from './infrastructure/persistence/relational/entities/office-rate.entity';
import { OfficeActivityData } from './types';

export interface OfficeRatesWithActivityResponse {
  rates: OfficeRateEntity[];
  activityData: OfficeActivityData;
  summary: {
    totalRates: number;
    activePairs: number;
    lastUpdateFormatted: string;
    activityBadge: string;
  };
}

export interface OfficeActivityListResponse {
  data: OfficeActivityData[];
  period: string;
  totalOffices: number;
}

export interface OfficeRatesWithActivityResponse {
  rates: OfficeRateEntity[];
  activityData: OfficeActivityData;
  summary: {
    totalRates: number;
    activePairs: number;
    lastUpdateFormatted: string;
    activityBadge: string;
  };
}

@Injectable()
export class OfficeRatesService {
  constructor(
    // Dependencies here
    private readonly officeRateRepository: OfficeRateRepository,
    private readonly officesService: OfficesService,
    private readonly currenciesService: CurrenciesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(createOfficeRateDto: CreateOfficeRateDto) {
    try {
      // Do not remove comment below.
      // <creating-property />

      // Validate required fields
      if (!createOfficeRateDto.owner) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            owner: 'ownerRequired',
          },
        });
      }

      if (!createOfficeRateDto.targetCurrency) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            targetCurrency: 'targetCurrencyRequired',
          },
        });
      }

      // Validate target currency format
      const targetCurrencyCode =
        createOfficeRateDto.targetCurrency.toUpperCase();
      if (targetCurrencyCode.length !== 3) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            targetCurrency: 'invalidCurrencyFormat',
          },
        });
      }

      // Validate rate values if provided
      if (
        createOfficeRateDto.buyRate !== undefined &&
        createOfficeRateDto.buyRate <= 0
      ) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            buyRate: 'invalidBuyRate',
          },
        });
      }

      if (
        createOfficeRateDto.sellRate !== undefined &&
        createOfficeRateDto.sellRate <= 0
      ) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            sellRate: 'invalidSellRate',
          },
        });
      }

      // Validate rate relationship if both are provided
      if (
        createOfficeRateDto.buyRate !== undefined &&
        createOfficeRateDto.sellRate !== undefined &&
        createOfficeRateDto.buyRate >= createOfficeRateDto.sellRate
      ) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            rates: 'buyRateMustBeLowerThanSellRate',
          },
        });
      }

      // Find office
      const office = await this.officesService.getUserOffice(
        createOfficeRateDto.owner,
      );
      if (!office) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          errors: {
            office: 'officeNotFound',
          },
        });
      }

      // Find target currency
      const targetCurrency =
        await this.currenciesService.findByCode(targetCurrencyCode);
      if (!targetCurrency) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          errors: {
            targetCurrency: 'targetCurrencyNotFound',
          },
        });
      }

      // Validate target currency is not the same as base currency
      if (targetCurrency.code === 'MAD') {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            targetCurrency: 'cannotUseBaseCurrencyAsTarget',
          },
        });
      }

      // Get default base currency (MAD)
      const baseCurrency =
        await this.currenciesService.getDefaultBaseCurrencyMAD();
      if (!baseCurrency) {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            baseCurrency: 'baseCurrencyNotConfigured',
          },
        });
      }

      // Check if rate already exists for this office and currency pair
      const existingRate =
        await this.officeRateRepository.findByOfficeAndCurrency(
          office.id,
          targetCurrency.id,
        );
      if (existingRate) {
        throw new ConflictException({
          status: HttpStatus.CONFLICT,
          errors: {
            rate: 'rateAlreadyExistsForCurrency',
          },
        });
      }

      // Create office rate
      const officeRate = await this.officeRateRepository.create({
        ...createOfficeRateDto,
        office: office as Office,
        baseCurrency: baseCurrency as Currency,
        targetCurrency: targetCurrency as Currency,
        // Do not remove comment below.
        // <creating-property-payload />
      });

      return officeRate;
    } catch (error) {
      // Re-throw NestJS exceptions with structured format
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }

      // Handle database constraint violations
      if (error?.code === '23505') {
        // PostgreSQL unique constraint violation
        const constraintName = error?.constraint || 'unknown';

        // Map constraint names to user-friendly field names
        const fieldMapping: Record<string, string> = {
          office_rate_office_currency_unique: 'rate',
          office_rate_unique: 'rate',
        };

        const field = fieldMapping[constraintName] || 'rate';

        throw new ConflictException({
          status: HttpStatus.CONFLICT,
          errors: {
            [field]: 'rateAlreadyExists',
          },
        });
      }

      if (error?.code === '23503') {
        // PostgreSQL foreign key constraint violation
        const constraintName = error?.constraint || 'unknown';

        // Map foreign key constraints to fields
        const fieldMapping: Record<string, string> = {
          office_rate_office_fk: 'office',
          office_rate_base_currency_fk: 'baseCurrency',
          office_rate_target_currency_fk: 'targetCurrency',
        };

        const field = fieldMapping[constraintName] || 'reference';

        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            [field]: 'invalidReference',
          },
        });
      }

      if (error?.code === '23514') {
        // PostgreSQL check constraint violation
        const constraintName = error?.constraint || 'unknown';

        // Map check constraints to meaningful errors
        if (constraintName.includes('rate_positive')) {
          throw new BadRequestException({
            status: HttpStatus.BAD_REQUEST,
            errors: {
              rate: 'rateMustBePositive',
            },
          });
        }

        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            data: 'violatesBusinessRules',
          },
        });
      }

      if (error?.code === '23502') {
        // PostgreSQL not null constraint violation
        const column = error?.column || 'unknown';
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            [column]: 'fieldRequired',
          },
        });
      }

      // Handle validation errors
      if (
        error?.name === 'ValidationError' ||
        error?.constructor?.name === 'ValidationError'
      ) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            validation: 'invalidDataProvided',
          },
        });
      }

      // Handle timeout errors
      if (error?.name === 'TimeoutError' || error?.code === 'ETIMEDOUT') {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            timeout: 'requestTimeout',
          },
        });
      }

      // Handle network/connection errors
      if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            connection: 'serviceUnavailable',
          },
        });
      }

      // Handle memory/resource errors
      if (error?.code === 'ENOMEM') {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            resource: 'insufficientMemory',
          },
        });
      }

      // Handle decimal/numeric errors
      if (error?.code === '22003') {
        // Numeric value out of range
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            rate: 'rateValueOutOfRange',
          },
        });
      }

      if (error?.code === '22P02') {
        // Invalid text representation
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            data: 'invalidDataFormat',
          },
        });
      }

      // Handle any other unexpected errors without exposing internal details
      console.error('Unexpected error creating office rate:', error);
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: {
          rate: 'creationFailed',
        },
      });
    }
  }

  async createRateManagement(createOfficeRateDto: CreateOfficeRateDto) {
    try {
      // Do not remove comment below.
      // <creating-property />

      if (!createOfficeRateDto.officeId) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            officeId: 'officeIdRequired',
          },
        });
      }

      if (!createOfficeRateDto.targetCurrency) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            targetCurrency: 'targetCurrencyRequired',
          },
        });
      }

      // Validate target currency format
      const targetCurrencyCode =
        createOfficeRateDto.targetCurrency.toUpperCase();
      if (targetCurrencyCode.length !== 3) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            targetCurrency: 'invalidCurrencyFormat',
          },
        });
      }

      // Validate rate values if provided
      if (
        createOfficeRateDto.buyRate !== undefined &&
        createOfficeRateDto.buyRate <= 0
      ) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            buyRate: 'invalidBuyRate',
          },
        });
      }

      if (
        createOfficeRateDto.sellRate !== undefined &&
        createOfficeRateDto.sellRate <= 0
      ) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            sellRate: 'invalidSellRate',
          },
        });
      }

      // Validate rate relationship if both are provided
      if (
        createOfficeRateDto.buyRate !== undefined &&
        createOfficeRateDto.sellRate !== undefined &&
        createOfficeRateDto.buyRate >= createOfficeRateDto.sellRate
      ) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            rates: 'buyRateMustBeLowerThanSellRate',
          },
        });
      }

      // Find office
      const office = await this.officesService.findById(
        createOfficeRateDto.officeId,
      );
      if (!office) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          errors: {
            office: 'officeNotFound',
          },
        });
      }

      // Find target currency
      const targetCurrency =
        await this.currenciesService.findByCode(targetCurrencyCode);
      if (!targetCurrency) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          errors: {
            targetCurrency: 'targetCurrencyNotFound',
          },
        });
      }

      // Validate target currency is not the same as base currency
      if (targetCurrency.code === 'MAD') {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            targetCurrency: 'cannotUseBaseCurrencyAsTarget',
          },
        });
      }

      // Get default base currency (MAD)
      const baseCurrency =
        await this.currenciesService.getDefaultBaseCurrencyMAD();
      if (!baseCurrency) {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            baseCurrency: 'baseCurrencyNotConfigured',
          },
        });
      }

      // Check if rate already exists for this office and currency pair
      const existingRate =
        await this.officeRateRepository.findByOfficeAndCurrency(
          office.id,
          targetCurrency.id,
        );
      if (existingRate) {
        throw new ConflictException({
          status: HttpStatus.CONFLICT,
          errors: {
            rate: 'rateAlreadyExistsForCurrency',
          },
        });
      }

      // Create office rate
      const officeRate = await this.officeRateRepository.create({
        ...createOfficeRateDto,
        office: office as Office,
        baseCurrency: baseCurrency as Currency,
        targetCurrency: targetCurrency as Currency,
        // Do not remove comment below.
        // <creating-property-payload />
      });

      return officeRate;
    } catch (error) {
      // Re-throw NestJS exceptions with structured format
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }

      // Handle database constraint violations
      if (error?.code === '23505') {
        // PostgreSQL unique constraint violation
        const constraintName = error?.constraint || 'unknown';

        // Map constraint names to user-friendly field names
        const fieldMapping: Record<string, string> = {
          office_rate_office_currency_unique: 'rate',
          office_rate_unique: 'rate',
        };

        const field = fieldMapping[constraintName] || 'rate';

        throw new ConflictException({
          status: HttpStatus.CONFLICT,
          errors: {
            [field]: 'rateAlreadyExists',
          },
        });
      }

      if (error?.code === '23503') {
        // PostgreSQL foreign key constraint violation
        const constraintName = error?.constraint || 'unknown';

        // Map foreign key constraints to fields
        const fieldMapping: Record<string, string> = {
          office_rate_office_fk: 'office',
          office_rate_base_currency_fk: 'baseCurrency',
          office_rate_target_currency_fk: 'targetCurrency',
        };

        const field = fieldMapping[constraintName] || 'reference';

        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            [field]: 'invalidReference',
          },
        });
      }

      if (error?.code === '23514') {
        // PostgreSQL check constraint violation
        const constraintName = error?.constraint || 'unknown';

        // Map check constraints to meaningful errors
        if (constraintName.includes('rate_positive')) {
          throw new BadRequestException({
            status: HttpStatus.BAD_REQUEST,
            errors: {
              rate: 'rateMustBePositive',
            },
          });
        }

        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            data: 'violatesBusinessRules',
          },
        });
      }

      if (error?.code === '23502') {
        // PostgreSQL not null constraint violation
        const column = error?.column || 'unknown';
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            [column]: 'fieldRequired',
          },
        });
      }

      // Handle validation errors
      if (
        error?.name === 'ValidationError' ||
        error?.constructor?.name === 'ValidationError'
      ) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            validation: 'invalidDataProvided',
          },
        });
      }

      // Handle timeout errors
      if (error?.name === 'TimeoutError' || error?.code === 'ETIMEDOUT') {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            timeout: 'requestTimeout',
          },
        });
      }

      // Handle network/connection errors
      if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            connection: 'serviceUnavailable',
          },
        });
      }

      // Handle memory/resource errors
      if (error?.code === 'ENOMEM') {
        throw new InternalServerErrorException({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          errors: {
            resource: 'insufficientMemory',
          },
        });
      }

      // Handle decimal/numeric errors
      if (error?.code === '22003') {
        // Numeric value out of range
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            rate: 'rateValueOutOfRange',
          },
        });
      }

      if (error?.code === '22P02') {
        // Invalid text representation
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            data: 'invalidDataFormat',
          },
        });
      }

      // Handle any other unexpected errors without exposing internal details
      console.error('Unexpected error creating office rate:', error);
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: {
          rate: 'creationFailed',
        },
      });
    }
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.officeRateRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: OfficeRate['id']) {
    return this.officeRateRepository.findById(id);
  }

  findByIds(ids: OfficeRate['id'][]) {
    return this.officeRateRepository.findByIds(ids);
  }

  async update(id: OfficeRate['id'], updateOfficeRateDto: UpdateOfficeRateDto) {
    try {
      // Do not remove comment below.
      // <updating-property />

      if (!id) {
        throw new BadRequestException({
          status: HttpStatus.BAD_REQUEST,
          errors: {
            officeRate: 'missingOfficeRateId',
          },
        });
      }

      const oldOfficeRate = await this.officeRateRepository.findById(id);
      if (!oldOfficeRate) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          errors: {
            officeRate: 'officeRateNotFound',
          },
        });
      }

      const updatedOfficeRate = await this.officeRateRepository.update(id, {
        ...updateOfficeRateDto,
        // Do not remove comment below.
        // <updating-property-payload />
      });

      if (!updatedOfficeRate) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          errors: {
            officeRate: 'officeRateNotFound',
          },
        });
      }

      // only if buyRate or sellRate has changed
      if (
        oldOfficeRate.buyRate != updatedOfficeRate.buyRate ||
        oldOfficeRate.sellRate != updatedOfficeRate.sellRate
      ) {
        console.log(
          `buyRate or sellRate has changed from ${oldOfficeRate.buyRate} to ${updatedOfficeRate.buyRate}`,
          `sellRate has changed from ${oldOfficeRate.sellRate} to ${updatedOfficeRate.sellRate}`,
        );
        try {
          const rateUpdateEvent = new RateUpdateEvent(
            oldOfficeRate.office,
            oldOfficeRate.targetCurrency,
            oldOfficeRate.baseCurrency,
            oldOfficeRate.buyRate,
            oldOfficeRate.sellRate,
            updatedOfficeRate.buyRate,
            updatedOfficeRate.sellRate,
            updatedOfficeRate.isActive,
          );
          this.eventEmitter.emit('rate.update', rateUpdateEvent);
        } catch (eventError) {
          // We don't want to fail the update if the event emission fails,
          // but we still inform the client about the issue
          throw new UnprocessableEntityException({
            status: HttpStatus.UNPROCESSABLE_ENTITY,
            errors: {
              officeRate: 'rateUpdateEventFailed',
              details: eventError.message,
            },
          });
        }
      }

      return updatedOfficeRate;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnprocessableEntityException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      console.error(error);
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          officeRate: 'failedToUpdateOfficeRate',
          details: error.message,
        },
      });
    }
  }

  remove(id: OfficeRate['id']) {
    return this.officeRateRepository.remove(id);
  }

  getCityRankingForExchangeRates({
    baseCurrencyCode,
    targetCurrencyCode,
    amount,
  }: CityRankingParams): Promise<CityRankingResult[]> {
    return this.officeRateRepository.getCityRankingForExchangeRates({
      baseCurrencyCode,
      targetCurrencyCode,
      amount,
    });
  }

  async getOfficeRatesByOfficeId(userId: string): Promise<any> {
    const office = await this.officesService.getUserOffice(userId);
    if (!office) {
      throw new NotFoundException('Office not found');
    }

    const rates = await this.officeRateRepository.getOfficeRatesByOfficeId(
      office.id,
    );

    if (!rates.length) {
      return {
        lastUpdatedAt: new Date(),
        rates: [],
      };
    }

    const lastUpdatedAt = rates.reduce((latest, rate) => {
      const updatedAt = new Date(rate.updatedAt);
      return updatedAt > latest ? updatedAt : latest;
    }, new Date(rates[0].updatedAt));

    return {
      lastUpdatedAt,
      rates,
    };
  }

  /**
   * Get office activity data for all offices
   */
  async getOfficeActivityList(
    params: GetOfficeActivityParams = {},
  ): Promise<OfficeActivityListResponse> {
    const { period = '7days' } = params;

    const [data, totalCount] = await Promise.all([
      this.officeRateRepository.getOfficeActivityData(params),
      this.officeRateRepository.getOfficeActivityDataCount(params),
    ]);

    return {
      data,
      period: this.formatPeriod(period),
      totalOffices: totalCount,
    };
  }

  /**
   * Get rates and activity data for a specific office
   */
  async getOfficeRatesWithActivity(
    officeId: string,
    period: '7days' | '30days' | '90days' = '7days',
  ): Promise<OfficeRatesWithActivityResponse> {
    const result = await this.officeRateRepository.getOfficeRatesWithActivity(
      officeId,
      period,
    );

    if (!result.rates.length && !result.activityData) {
      throw new NotFoundException(`Office with ID ${officeId} not found`);
    }

    const summary = {
      totalRates: result.rates.length,
      activePairs: result.rates.filter((rate) => rate.isActive).length,
      lastUpdateFormatted: this.formatDate(result.activityData.lastUpdate),
      activityBadge: result.activityData.activityStatus,
    };

    return {
      ...result,
      summary,
    };
  }

  /**
   * Get top most active offices
   */
  async getTopActiveOffices(
    period: '7days' | '30days' | '90days' = '7days',
    limit: number = 10,
  ): Promise<{
    data: OfficeActivityData[];
    period: string;
    criteria: string;
  }> {
    const data = await this.officeRateRepository.getTopActiveOffices(
      period,
      limit,
    );

    return {
      data,
      period: this.formatPeriod(period),
      criteria: 'Most rate updates',
    };
  }

  /**
   * Get activity statistics for dashboard - this should NOT be used for the table
   * This is for overall statistics only
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
    const data = await this.officeRateRepository.getOfficeActivityData({
      period,
    });

    const summary = this.calculateActivitySummary(data);
    const totalOffices = data.length;
    const activeOffices = summary.veryActive + summary.active;
    const totalUpdates = data.reduce(
      (sum, office) => sum + office.updatesCount,
      0,
    );
    const averageUpdates =
      totalOffices > 0 ? Math.round(totalUpdates / totalOffices) : 0;

    return {
      period: this.formatPeriod(period),
      totalOffices,
      activeOffices,
      averageUpdates,
      distribution: {
        veryActive: {
          count: summary.veryActive,
          percentage: this.calculatePercentage(
            summary.veryActive,
            totalOffices,
          ),
        },
        active: {
          count: summary.active,
          percentage: this.calculatePercentage(summary.active, totalOffices),
        },
        lowActivity: {
          count: summary.lowActivity,
          percentage: this.calculatePercentage(
            summary.lowActivity,
            totalOffices,
          ),
        },
        inactive: {
          count: summary.inactive,
          percentage: this.calculatePercentage(summary.inactive, totalOffices),
        },
      },
    };
  }

  /**
   * Search offices by activity status and location
   */
  async searchOfficesByActivity(
    activityStatus: 'Very Active' | 'Active' | 'Low Activity' | 'Inactive',
    cityId?: string,
    countryId?: string,
    period: '7days' | '30days' | '90days' = '7days',
  ): Promise<OfficeActivityData[]> {
    const allData = await this.officeRateRepository.getOfficeActivityData({
      period,
      cityId,
      countryId,
      limit: 1000, // Get all matching records
    });

    return allData.filter((office) => office.activityStatus === activityStatus);
  }

  private calculateActivitySummary(data: OfficeActivityData[]) {
    return {
      total: data.length,
      veryActive: data.filter(
        (office) => office.activityStatus === 'Very Active',
      ).length,
      active: data.filter((office) => office.activityStatus === 'Active')
        .length,
      lowActivity: data.filter(
        (office) => office.activityStatus === 'Low Activity',
      ).length,
      inactive: data.filter((office) => office.activityStatus === 'Inactive')
        .length,
    };
  }

  private calculatePercentage(count: number, total: number): number {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }

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

  private formatDate(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  async bulkUpdateOfficeRates(bulkUpdateDto: BulkUpdateOfficeRatesDto) {
    try {
      const { rates, officeSlugs } = bulkUpdateDto;

      // Find offices by slugs
      const offices = await this.officesService.findBySlugs(officeSlugs);

      if (offices.length === 0) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          errors: {
            offices: 'noOfficesFoundWithProvidedSlugs',
          },
        });
      }

      // Get MAD currency (base currency)
      const madCurrency =
        await this.currenciesService.getDefaultBaseCurrencyMAD();
      if (!madCurrency) {
        throw new NotFoundException({
          status: HttpStatus.NOT_FOUND,
          errors: {
            currency: 'defaultMADCurrencyNotFound',
          },
        });
      }

      const results = {
        updated: 0,
        created: 0,
        errors: 0,
      };

      const details: Array<{
        officeSlug: string | null | undefined;
        currency: string;
        action: 'updated' | 'created' | 'error';
        message: string;
      }> = [];

      // Process each office
      for (const office of offices) {
        // Process each currency rate
        for (const rateData of rates) {
          try {
            // Validate rate relationship
            if (rateData.buy >= rateData.sell) {
              details.push({
                officeSlug: office.slug,
                currency: rateData.currency,
                action: 'error',
                message: 'buyRateMustBeLowerThanSellRate',
              });
              results.errors++;
              continue;
            }

            // Find target currency
            const targetCurrency = await this.currenciesService.findByCode(
              rateData.currency,
            );
            if (!targetCurrency) {
              details.push({
                officeSlug: office.slug,
                currency: rateData.currency,
                action: 'error',
                message: 'currencyNotFound',
              });
              results.errors++;
              continue;
            }

            // Check if rate already exists
            const existingRate =
              await this.officeRateRepository.findByOfficeAndCurrency(
                office.id,
                targetCurrency.id,
              );

            if (existingRate) {
              // Update existing rate
              const oldBuyRate = existingRate.buyRate;
              const oldSellRate = existingRate.sellRate;

              await this.officeRateRepository.update(existingRate.id, {
                buyRate: rateData.buy,
                sellRate: rateData.sell,
                isActive: true,
              });

              // Emit rate update event
              try {
                const rateUpdateEvent = new RateUpdateEvent(
                  office,
                  targetCurrency,
                  madCurrency,
                  oldBuyRate,
                  oldSellRate,
                  rateData.buy,
                  rateData.sell,
                  true,
                );
                this.eventEmitter.emit('rate.update', rateUpdateEvent);
              } catch (eventError) {
                console.error('Failed to emit rate update event:', eventError);
              }

              details.push({
                officeSlug: office.slug,
                currency: rateData.currency,
                action: 'updated',
                message: 'rateUpdatedSuccessfully',
              });
              results.updated++;
            } else {
              // Create new rate
              await this.officeRateRepository.create({
                office: office,
                baseCurrency: madCurrency,
                targetCurrency: targetCurrency,
                buyRate: rateData.buy,
                sellRate: rateData.sell,
                isActive: true,
              });

              details.push({
                officeSlug: office.slug,
                currency: rateData.currency,
                action: 'created',
                message: 'rateCreatedSuccessfully',
              });
              results.created++;
            }
          } catch (error) {
            console.error(
              `Error processing rate for office ${office.slug} and currency ${rateData.currency}:`,
              error,
            );
            details.push({
              officeSlug: office.slug,
              currency: rateData.currency,
              action: 'error',
              message: error.message || 'unknownError',
            });
            results.errors++;
          }
        }
      }

      return {
        success: true,
        message: 'bulkUpdateCompleted',
        results,
        details,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Bulk update office rates error:', error);
      throw new InternalServerErrorException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        errors: {
          bulkUpdate: 'bulkUpdateFailed',
          details: error.message,
        },
      });
    }
  }
}
