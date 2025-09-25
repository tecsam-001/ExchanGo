import {
  HttpStatus,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateRateHistoryDto } from './dto/create-rate-history.dto';
import { UpdateRateHistoryDto } from './dto/update-rate-history.dto';
import { RateHistoryRepository } from './infrastructure/persistence/rate-history.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { RateHistory } from './domain/rate-history';
import { OnEvent } from '@nestjs/event-emitter';
import { RateUpdateEvent } from '../events/rate-update.event';
import { OfficesService } from 'src/offices/offices.service';
import { TimePeriod } from './dto/get-rate-histories-query.dto';

@Injectable()
export class RateHistoriesService {
  constructor(
    // Dependencies here
    private readonly rateHistoryRepository: RateHistoryRepository,
    private readonly officesService: OfficesService,
  ) {}

  async create(createRateHistoryDto: CreateRateHistoryDto) {
    // Do not remove comment below.
    // <creating-property />

    return this.rateHistoryRepository.create({
      ...createRateHistoryDto,
      // Do not remove comment below.
      // <creating-property-payload />
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.rateHistoryRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: RateHistory['id']) {
    return this.rateHistoryRepository.findById(id);
  }

  findByIds(ids: RateHistory['id'][]) {
    return this.rateHistoryRepository.findByIds(ids);
  }

  async update(
    id: RateHistory['id'],

    updateRateHistoryDto: UpdateRateHistoryDto,
  ) {
    // Do not remove comment below.
    // <updating-property />

    return this.rateHistoryRepository.update(id, {
      ...updateRateHistoryDto,
      // Do not remove comment below.
      // <updating-property-payload />
    });
  }

  remove(id: RateHistory['id']) {
    return this.rateHistoryRepository.remove(id);
  }

  @OnEvent('rate.update')
  async handleRateUpdate(event: RateUpdateEvent) {
    try {
      await this.create({
        office: event.office,
        targetCurrency: event.targetCurrency,
        baseCurrency: event.baseCurrency,
        oldBuyRate: event.oldBuyRate,
        oldSellRate: event.oldSellRate,
        newBuyRate: event.newBuyRate,
        newSellRate: event.newSellRate,
        isActive: event.isActive,
      });
    } catch {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          rateHistory: 'rateHistoryNotFound',
        },
      });
    }
  }

  async getRateHistoriesByOfficeId(
    userId: string,
    timePeriod: TimePeriod = TimePeriod.ALL_HISTORY,
  ): Promise<RateHistory[]> {
    const office = await this.officesService.getUserOffice(userId);

    if (!office) {
      throw new NotFoundException('Office not found');
    }

    return this.rateHistoryRepository.getRateHistoriesByOfficeId(
      office.id,
      timePeriod,
    );
  }

  async getOfficeRateHistoriesCountByPeriod(
    officeId: string,
    timePeriod: TimePeriod = TimePeriod.ALL_HISTORY,
  ): Promise<number> {
    return this.rateHistoryRepository.getOfficeRateHistoriesCountByPeriod(
      officeId,
      timePeriod,
    );
  }

  /**
   * Get count of rate histories created in a specific time period for all offices
   */
  async getRateHistoriesCreatedCount(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.rateHistoryRepository.getRateHistoriesCreatedCount(
      startDate,
      endDate,
    );
  }

  /**
   * Get count of rate histories for a specific office in a date range
   */
  async getRateHistoriesCountByOfficeAndDateRange(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    return this.rateHistoryRepository.getRateHistoriesCountByOfficeAndDateRange(
      officeId,
      startDate,
      endDate,
    );
  }

  /**
   * Get bulk rate histories counts for multiple offices
   */
  async getBulkRateHistoriesCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    return this.rateHistoryRepository.getBulkRateHistoriesCounts(
      officeIds,
      startDate,
      endDate,
    );
  }
}
