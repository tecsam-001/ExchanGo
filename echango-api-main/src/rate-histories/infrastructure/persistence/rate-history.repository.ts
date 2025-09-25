import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { RateHistory } from '../../domain/rate-history';
import { TimePeriod } from '../../dto/get-rate-histories-query.dto';

export abstract class RateHistoryRepository {
  abstract create(
    data: Omit<RateHistory, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<RateHistory>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<RateHistory[]>;

  abstract findById(id: RateHistory['id']): Promise<NullableType<RateHistory>>;

  abstract findByIds(ids: RateHistory['id'][]): Promise<RateHistory[]>;

  abstract update(
    id: RateHistory['id'],
    payload: DeepPartial<RateHistory>,
  ): Promise<RateHistory | null>;

  abstract remove(id: RateHistory['id']): Promise<void>;

  abstract getRateHistoriesByOfficeId(
    officeId: string,
    timePeriod: TimePeriod,
  ): Promise<RateHistory[]>;

  abstract getOfficeRateHistoriesCountByPeriod(
    officeId: string,
    timePeriod: TimePeriod,
  ): Promise<number>;

  abstract getRateHistoriesCreatedCount(
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract getRateHistoriesCountByOfficeAndDateRange(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract getBulkRateHistoriesCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>>;
}
