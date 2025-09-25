import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { City } from '../../cities/domain/city';
import { Office } from '../domain/office';

export class OfficeStatistics {
  @ApiProperty({
    description: 'Total number of offices in the city',
    example: 15,
  })
  totalOffices: number;

  @ApiProperty({
    description: 'Number of active offices',
    example: 12,
  })
  activeOffices: number;

  @ApiProperty({
    description: 'Number of verified offices',
    example: 8,
  })
  verifiedOffices: number;

  @ApiProperty({
    description: 'Number of featured offices',
    example: 3,
  })
  featuredOffices: number;

  @ApiProperty({
    description: 'Average rating of offices (if available)',
    example: 4.2,
    required: false,
  })
  averageRating?: number;

  @ApiProperty({
    description: 'Most recent office creation date',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  newestOfficeDate?: Date;

  @ApiProperty({
    description: 'Available currencies in this city',
    example: ['USD', 'EUR', 'GBP'],
    type: [String],
  })
  availableCurrencies: string[];

  @ApiProperty({
    description: 'Number of offices currently open',
    example: 5,
  })
  currentlyOpenOffices: number;
}

export class SimplifiedOffice {
  @ApiProperty({
    description: 'Office ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Office name',
    example: 'Exchange Plus Casablanca',
  })
  officeName: string;

  @ApiProperty({
    description: 'Office address',
    example: '123 Hassan II Boulevard, Casablanca',
  })
  address: string;

  @ApiProperty({
    description: 'Primary phone number',
    example: '+212522123456',
  })
  primaryPhoneNumber: string;

  @ApiProperty({
    description: 'Office slug for URL',
    example: 'exchange-plus-casablanca',
  })
  slug: string;

  @ApiProperty({
    description: 'Whether the office is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether the office is verified',
    example: true,
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Whether the office is featured',
    example: false,
  })
  isFeatured: boolean;

  @ApiPropertyOptional({
    description: 'Office logo URL',
    example: 'https://example.com/logo.jpg',
  })
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Whether the office is currently open',
    example: true,
  })
  isCurrentlyOpen?: boolean;

  @ApiPropertyOptional({
    description: "Today's working hours",
    example: '09:00 - 17:00',
  })
  todayWorkingHours?: string;
}

export class CityWithOfficesResponse {
  @ApiProperty({
    description: 'City information',
    type: City,
  })
  city: City;

  @ApiProperty({
    description: 'Office statistics for this city',
    type: OfficeStatistics,
  })
  statistics: OfficeStatistics;

  @ApiPropertyOptional({
    description: 'List of offices in the city (if requested)',
    type: [SimplifiedOffice],
  })
  offices?: SimplifiedOffice[];

  @ApiPropertyOptional({
    description: 'Detailed office information (if requested)',
    type: [Office],
  })
  detailedOffices?: Office[];
}

export class SearchMetadata {
  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of cities found',
    example: 25,
  })
  totalCities: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there are more pages',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there are previous pages',
    example: false,
  })
  hasPreviousPage: boolean;
}

export class SearchSummary {
  @ApiProperty({
    description: 'Total offices across all cities',
    example: 150,
  })
  totalOfficesFound: number;

  @ApiProperty({
    description: 'Total active offices',
    example: 120,
  })
  totalActiveOffices: number;

  @ApiProperty({
    description: 'Total verified offices',
    example: 80,
  })
  totalVerifiedOffices: number;

  @ApiProperty({
    description: 'Search query used',
    example: 'Casa',
  })
  searchQuery: string;

  @ApiProperty({
    description: 'Search execution time in milliseconds',
    example: 45,
  })
  executionTimeMs: number;
}

export class SearchCitiesWithOfficesResponse {
  @ApiProperty({
    description: 'List of cities with their office information',
    type: [CityWithOfficesResponse],
  })
  data: CityWithOfficesResponse[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: SearchMetadata,
  })
  meta: SearchMetadata;

  @ApiProperty({
    description: 'Search summary statistics',
    type: SearchSummary,
  })
  summary: SearchSummary;
}
