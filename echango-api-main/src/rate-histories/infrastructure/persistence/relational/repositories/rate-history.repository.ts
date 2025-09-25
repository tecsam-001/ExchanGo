import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThan, Between } from 'typeorm';
import { RateHistoryEntity } from '../entities/rate-history.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { RateHistory } from '../../../../domain/rate-history';
import { RateHistoryRepository } from '../../rate-history.repository';
import { RateHistoryMapper } from '../mappers/rate-history.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

export enum TimePeriod {
  LAST_SEVEN_DAYS = 'LAST_SEVEN_DAYS',
  LAST_ONE_MONTH = 'LAST_ONE_MONTH',
  LAST_SIX_MONTHS = 'LAST_SIX_MONTHS',
  LAST_ONE_YEAR = 'LAST_ONE_YEAR',
  ALL_HISTORY = 'ALL_HISTORY',
}

@Injectable()
export class RateHistoryRelationalRepository implements RateHistoryRepository {
  constructor(
    @InjectRepository(RateHistoryEntity)
    private readonly rateHistoryRepository: Repository<RateHistoryEntity>,
  ) {}

  async create(data: RateHistory): Promise<RateHistory> {
    const persistenceModel = RateHistoryMapper.toPersistence(data);
    const newEntity = await this.rateHistoryRepository.save(
      this.rateHistoryRepository.create(persistenceModel),
    );
    return RateHistoryMapper.toDomain(newEntity);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<RateHistory[]> {
    const entities = await this.rateHistoryRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });

    return entities.map((entity) => RateHistoryMapper.toDomain(entity));
  }

  async findById(id: RateHistory['id']): Promise<NullableType<RateHistory>> {
    const entity = await this.rateHistoryRepository.findOne({
      where: { id },
    });

    return entity ? RateHistoryMapper.toDomain(entity) : null;
  }

  async findByIds(ids: RateHistory['id'][]): Promise<RateHistory[]> {
    const entities = await this.rateHistoryRepository.find({
      where: { id: In(ids) },
    });

    return entities.map((entity) => RateHistoryMapper.toDomain(entity));
  }

  async update(
    id: RateHistory['id'],
    payload: Partial<RateHistory>,
  ): Promise<RateHistory> {
    const entity = await this.rateHistoryRepository.findOne({
      where: { id },
    });

    if (!entity) {
      throw new Error('Record not found');
    }

    const updatedEntity = await this.rateHistoryRepository.save(
      this.rateHistoryRepository.create(
        RateHistoryMapper.toPersistence({
          ...RateHistoryMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return RateHistoryMapper.toDomain(updatedEntity);
  }

  async remove(id: RateHistory['id']): Promise<void> {
    await this.rateHistoryRepository.delete(id);
  }

  async getRateHistoriesByOfficeId(
    officeId: string,
    timePeriod: TimePeriod = TimePeriod.ALL_HISTORY,
  ): Promise<RateHistory[]> {
    const whereCondition: any = {
      office: { id: officeId },
    };

    // Add date filtering based on time period
    if (timePeriod !== TimePeriod.ALL_HISTORY) {
      const cutoffDate = this.calculateCutoffDate(timePeriod);
      whereCondition.createdAt = MoreThan(cutoffDate);
    }

    const entities = await this.rateHistoryRepository.find({
      where: whereCondition,
      order: { createdAt: 'DESC' }, // Most recent first
    });

    return entities.map((entity) => RateHistoryMapper.toDomain(entity));
  }

  private calculateCutoffDate(timePeriod: TimePeriod): Date {
    const now = new Date();

    switch (timePeriod) {
      case TimePeriod.LAST_SEVEN_DAYS:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      case TimePeriod.LAST_ONE_MONTH:
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return oneMonthAgo;

      case TimePeriod.LAST_SIX_MONTHS:
        const sixMonthsAgo = new Date(now);
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        return sixMonthsAgo;

      case TimePeriod.LAST_ONE_YEAR:
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);
        return oneYearAgo;

      default:
        return new Date(0); // Beginning of time
    }
  }

  async getOfficeRateHistoriesCountByPeriod(
    officeId: string,
    timePeriod: TimePeriod = TimePeriod.ALL_HISTORY,
  ): Promise<number> {
    const whereCondition: any = {
      office: { id: officeId },
    };

    // Add date filtering based on time period
    if (timePeriod !== TimePeriod.ALL_HISTORY) {
      const cutoffDate = this.calculateCutoffDate(timePeriod);
      whereCondition.createdAt = MoreThan(cutoffDate);
    }

    const count = await this.rateHistoryRepository.count({
      where: whereCondition,
    });

    return count;
  }

  async getRateHistoriesCreatedCount(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const count = await this.rateHistoryRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    return count;
  }

  async getRateHistoriesCountByOfficeAndDateRange(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const count = await this.rateHistoryRepository.count({
      where: {
        office: { id: officeId },
        createdAt: Between(startDate, endDate),
      },
    });

    return count;
  }

  async getBulkRateHistoriesCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>> {
    if (officeIds.length === 0) {
      return {};
    }

    const results = await this.rateHistoryRepository
      .createQueryBuilder('rh')
      .innerJoin('rh.office', 'office')
      .select('office.id', 'officeId')
      .addSelect('COUNT(rh.id)', 'count')
      .where('office.id IN (:...officeIds)', { officeIds })
      .andWhere('rh.createdAt >= :startDate', { startDate })
      .andWhere('rh.createdAt <= :endDate', { endDate })
      .groupBy('office.id')
      .getRawMany();

    const countsMap: Record<string, number> = {};
    results.forEach((result) => {
      countsMap[result.officeId] = parseInt(result.count, 10);
    });

    return countsMap;
  }
}
