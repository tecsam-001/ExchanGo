import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Alert } from '../../domain/alert';

export abstract class AlertRepository {
  abstract create(
    data: Omit<Alert, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>,
  ): Promise<Alert>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Alert[]>;

  abstract findById(id: Alert['id']): Promise<NullableType<Alert>>;

  abstract findByIds(ids: Alert['id'][]): Promise<Alert[]>;

  abstract update(
    id: Alert['id'],
    payload: DeepPartial<Alert>,
  ): Promise<Alert | null>;

  abstract remove(id: Alert['id']): Promise<void>;

  abstract getMatchingAlerts({
    city,
    baseCurrencyId,
    targetCurrencyId,
    targetCurrencyRate,
  }: {
    city: string;
    baseCurrencyId: string;
    targetCurrencyId: string;
    targetCurrencyRate: number;
  }): Promise<Alert[]>;

  abstract getMatchingAlertsAdvanced({
    triggerType,
    city,
    office,
    baseCurrencyId,
    targetCurrencyId,
    targetCurrencyRate,
  }: {
    triggerType: import('../../infrastructure/persistence/relational/entities/alert.entity').TriggerType;
    city?: string;
    office?: string;
    baseCurrencyId: string;
    targetCurrencyId: string;
    targetCurrencyRate: number;
  }): Promise<Alert[]>;

  abstract getActiveAlertsCount(officeId: string): Promise<number>;

  abstract getActiveAlertsCountForPeriod(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract getAlertsCreatedCount(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract getAlertsCreatedCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract getActiveAlertsCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract getActiveAlertsCountForPeriodForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract getBulkAlertsCreatedCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>>;
}
