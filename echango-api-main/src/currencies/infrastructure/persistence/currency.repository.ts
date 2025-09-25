import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Currency } from '../../domain/currency';

export abstract class CurrencyRepository {
  abstract create(
    data: Omit<Currency, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Currency>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Currency[]>;

  abstract findById(id: Currency['id']): Promise<NullableType<Currency>>;

  abstract findByIds(ids: Currency['id'][]): Promise<Currency[]>;

  abstract findByCode(code: Currency['code']): Promise<NullableType<Currency>>;

  abstract searchByCode(query: string): Promise<Currency[]>;

  abstract update(
    id: Currency['id'],
    payload: DeepPartial<Currency>,
  ): Promise<Currency | null>;

  abstract remove(id: Currency['id']): Promise<void>;

  abstract getDefaultBaseCurrencyMAD(): Promise<Currency | null>;
}
