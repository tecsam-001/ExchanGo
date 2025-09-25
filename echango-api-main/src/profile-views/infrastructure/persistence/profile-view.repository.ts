import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { ProfileView } from '../../domain/profile-view';

export abstract class ProfileViewRepository {
  abstract create(
    data: Omit<ProfileView, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ProfileView>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<ProfileView[]>;

  abstract findById(id: ProfileView['id']): Promise<NullableType<ProfileView>>;

  abstract findByIds(ids: ProfileView['id'][]): Promise<ProfileView[]>;

  abstract update(
    id: ProfileView['id'],
    payload: DeepPartial<ProfileView>,
  ): Promise<ProfileView | null>;

  abstract remove(id: ProfileView['id']): Promise<void>;

  abstract getProfileViewsCount(
    officeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract getProfileViewsCountForAllOffices(
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract getBulkProfileViewsCounts(
    officeIds: string[],
    startDate: Date,
    endDate: Date,
  ): Promise<Record<string, number>>;
}
