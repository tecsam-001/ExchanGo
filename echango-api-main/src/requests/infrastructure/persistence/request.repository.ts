import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Request } from '../../domain/request';

export abstract class RequestRepository {
  abstract create(
    data: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Request>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Request[]>;

  abstract findById(id: Request['id']): Promise<NullableType<Request>>;

  abstract findByIds(ids: Request['id'][]): Promise<Request[]>;

  abstract update(
    id: Request['id'],
    payload: DeepPartial<Request>,
  ): Promise<Request | null>;

  abstract remove(id: Request['id']): Promise<void>;
}
