import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { OfficeRate } from '../../domain/office-rate';
import {
  CityRankingParams,
  CityRankingResult,
  OfficeActivityData,
  GetOfficeActivityParams,
} from '../../types';
import { OfficeRateEntity } from './relational/entities/office-rate.entity';

export abstract class OfficeRateRepository {
  abstract create(
    data: Omit<OfficeRate, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<OfficeRate>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<OfficeRate[]>;

  abstract findById(id: OfficeRate['id']): Promise<NullableType<OfficeRate>>;

  abstract findByIds(ids: OfficeRate['id'][]): Promise<OfficeRate[]>;

  abstract update(
    id: OfficeRate['id'],
    payload: DeepPartial<OfficeRate>,
  ): Promise<OfficeRate | null>;

  abstract remove(id: OfficeRate['id']): Promise<void>;

  abstract getCityRankingForExchangeRates({
    baseCurrencyCode,
    targetCurrencyCode,
    amount,
  }: CityRankingParams): Promise<CityRankingResult[]>;

  abstract getOfficeRatesByOfficeId(officeId: string): Promise<OfficeRate[]>;

  abstract findByOfficeAndCurrency(
    officeId: string,
    currencyId: string,
  ): Promise<NullableType<OfficeRate>>;

  abstract getOfficeActivityData(
    params: GetOfficeActivityParams,
  ): Promise<OfficeActivityData[]>;

  abstract getOfficeActivityDataCount(
    params: GetOfficeActivityParams,
  ): Promise<number>;

  abstract getOfficeRatesWithActivity(
    officeId: string,
    period: '7days' | '30days' | '90days',
  ): Promise<{
    rates: OfficeRateEntity[];
    activityData: OfficeActivityData;
  }>;

  abstract getTopActiveOffices(
    period: '7days' | '30days' | '90days',
    limit: number,
  ): Promise<OfficeActivityData[]>;
}
