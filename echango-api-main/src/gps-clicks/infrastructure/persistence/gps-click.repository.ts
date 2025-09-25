import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { GpsClick } from '../../domain/gps-click';

export abstract class GpsClickRepository {
  abstract create(
    data: Omit<GpsClick, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<GpsClick>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<GpsClick[]>;

  abstract findById(id: GpsClick['id']): Promise<NullableType<GpsClick>>;

  abstract findByIds(ids: GpsClick['id'][]): Promise<GpsClick[]>;

  abstract update(
    id: GpsClick['id'],
    payload: DeepPartial<GpsClick>,
  ): Promise<GpsClick | null>;

  abstract remove(id: GpsClick['id']): Promise<void>;

  abstract getGpsClicksCount(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract getGpsClicksCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract getBulkGpsClicksCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>>;
}
