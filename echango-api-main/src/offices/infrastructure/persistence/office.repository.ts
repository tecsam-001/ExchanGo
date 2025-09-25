import { User } from '../../../users/domain/user';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Office } from '../../domain/office';
import { NearbyOfficeFilter } from '../../types';
import { PaginateQuery, Paginated } from 'nestjs-paginate';

export abstract class OfficeRepository {
  abstract create(
    data: Omit<
      Office,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'deletedAt'
      | 'isActive'
      | 'isVerified'
      | 'isFeatured'
    >,
  ): Promise<Office>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Office[]>;

  abstract findById(id: Office['id']): Promise<NullableType<Office>>;

  abstract findByIds(ids: Office['id'][]): Promise<Office[]>;

  abstract update(
    id: Office['id'],
    payload: DeepPartial<Office>,
  ): Promise<Office | null>;

  abstract remove(id: Office['id']): Promise<void>;

  abstract getUserOffice(owner: User['id']): Promise<Office | null>;

  abstract findNearbyOffices(
    latitude: number,
    longitude: number,
    radiusInKm: number,
    filter: NearbyOfficeFilter,
    limit: number,
    page: number,
  ): Promise<{
    offices: Office[];
    total: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
  }>;

  abstract markOfficeAsVerified(officeId: string): Promise<Office>;

  abstract getAuthenticatedUserOffice(
    owner: User['id'],
  ): Promise<Office | null>;

  abstract checkOfficeExistsUsingRegistrationNumber(
    registrationNumber: string,
  ): Promise<boolean>;

  abstract checkOfficeExistsUsingPrimaryPhoneNumber(
    primaryPhoneNumber: string,
  ): Promise<boolean>;

  abstract checkOfficeExistsUsingCurrencyExchangeLicenseNumber(
    currencyExchangeLicenseNumber: string,
  ): Promise<boolean>;

  abstract checkOfficeExistsUsingSlug(slug: string): Promise<boolean>;

  abstract checkOwnerHasOffice(owner: User['id']): Promise<boolean>;

  abstract findByCity(cityId: string): Promise<Office[]>;

  abstract findOfficesByCityName(
    query: PaginateQuery,
    cityName: string,
  ): Promise<Paginated<Office>>;

  abstract getOfficeBySlug(slug: string): Promise<Office | null>;

  abstract getOfficesCreatedCount(
    startDate: Date,
    endDate: Date,
  ): Promise<number>;

  abstract findBySlugs(slugs: string[]): Promise<Office[]>;

  abstract findAllForRateManagement(
    query: PaginateQuery,
    cityName?: string,
  ): Promise<Paginated<Office>>;
}
