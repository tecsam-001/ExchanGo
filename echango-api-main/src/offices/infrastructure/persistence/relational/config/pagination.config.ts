import {
  FilterOperator,
  PaginateConfig,
  PaginationType,
} from 'nestjs-paginate';
import { OfficeEntity } from '../entities/office.entity';
import { User } from '../../../../../users/domain/user';
import { City } from '../../../../../cities/domain/city';
// Base configuration
const baseOfficePaginationConfig: Omit<
  PaginateConfig<OfficeEntity>,
  'where'
> = {
  sortableColumns: [
    'officeName',
    'registrationNumber',
    'currencyExchangeLicenseNumber',
    'address',
    'city',
    'country',
    'state',
    'location',
    'primaryPhoneNumber',
    'secondaryPhoneNumber',
    'thirdPhoneNumber',
    'whatsappNumber',
    'email',
    'slug',
    'isActive',
  ],
  searchableColumns: [
    'officeName',
    'registrationNumber',
    'currencyExchangeLicenseNumber',
    'address',
  ],
  filterableColumns: {
    city: [FilterOperator.EQ],
    isActive: [FilterOperator.EQ],
    isVerified: [FilterOperator.EQ],
    isFeatured: [FilterOperator.EQ],
  },
  nullSort: 'last',
  defaultSortBy: [['createdAt', 'DESC']],
  relations: [
    'owner',
    'logo',
    'images',
    'city',
    'country',
    'workingHours',
    'faqs',
    'rates',
    'rates.baseCurrency',
    'rates.targetCurrency',
  ],
  loadEagerRelations: true,
  paginationType: PaginationType.TAKE_AND_SKIP,
};

// Global pagination configuration
export const officePaginationConfig: PaginateConfig<OfficeEntity> = {
  ...baseOfficePaginationConfig,
};

// User-specific pagination configuration
export function officePaginationConfigWithUser(
  userId: User['id'],
): PaginateConfig<OfficeEntity> {
  return {
    ...baseOfficePaginationConfig,
    where: {
      owner: {
        id: Number(userId),
      },
    },
  };
}

// city-specific pagination configuration
export function officePaginationConfigWithCity(
  cityName: City['name'],
): PaginateConfig<OfficeEntity> {
  return {
    ...baseOfficePaginationConfig,
    where: {
      city: {
        name: cityName,
      },
    },
  };
}

export function officePaginationConfigForRateManagement(
  cityName?: City['name'],
): PaginateConfig<OfficeEntity> {
  const config: PaginateConfig<OfficeEntity> = {
    ...baseOfficePaginationConfig,
  };

  // Only add the where clause if cityName is provided and not empty
  if (cityName && cityName.trim() !== '') {
    config.where = {
      city: {
        name: cityName.trim(),
      },
    };
  }

  return config;
}
