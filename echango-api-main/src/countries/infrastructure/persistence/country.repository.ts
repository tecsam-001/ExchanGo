import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Country } from '../../domain/country';

export abstract class CountryRepository {
  abstract create(
    data: Omit<Country, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Country>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Country[]>;

  abstract findById(id: Country['id']): Promise<NullableType<Country>>;

  abstract findByIds(ids: Country['id'][]): Promise<Country[]>;

  abstract update(
    id: Country['id'],
    payload: DeepPartial<Country>,
  ): Promise<Country | null>;

  abstract remove(id: Country['id']): Promise<void>;

  abstract getDefaultMorocco(): Promise<Country | null>;
}
