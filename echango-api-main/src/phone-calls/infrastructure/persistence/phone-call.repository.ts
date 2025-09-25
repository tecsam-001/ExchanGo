import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { PhoneCall } from '../../domain/phone-call';

export abstract class PhoneCallRepository {
  abstract create(
    data: Omit<PhoneCall, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PhoneCall>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<PhoneCall[]>;

  abstract findById(id: PhoneCall['id']): Promise<NullableType<PhoneCall>>;

  abstract findByIds(ids: PhoneCall['id'][]): Promise<PhoneCall[]>;

  abstract update(
    id: PhoneCall['id'],
    payload: DeepPartial<PhoneCall>,
  ): Promise<PhoneCall | null>;

  abstract remove(id: PhoneCall['id']): Promise<void>;

  abstract getPhoneCallsCount(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract getPhoneCallsCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract getBulkPhoneCallsCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>>;
}
