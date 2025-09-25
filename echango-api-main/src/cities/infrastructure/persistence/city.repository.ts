import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { City } from '../../domain/city';

export abstract class CityRepository {
  abstract create(
    data: Omit<City, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<City>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<City[]>;

  abstract findById(id: City['id']): Promise<NullableType<City>>;

  abstract findByIds(ids: City['id'][]): Promise<City[]>;

  abstract update(
    id: City['id'],
    payload: DeepPartial<City>,
  ): Promise<City | null>;

  abstract remove(id: City['id']): Promise<void>;

  abstract searchByName(name: string): Promise<City[]>;

  abstract searchByNameWithOffices(name: string): Promise<City[]>;
}
