import { ApiProperty } from '@nestjs/swagger';

export class AboutOfficeData {
  @ApiProperty({
    description: 'Office name',
    example: 'Exchange Office Downtown',
  })
  officeName: string;

  @ApiProperty({
    description: 'City name',
    example: 'Casablanca',
  })
  city: string;

  @ApiProperty({
    description: 'Country name',
    example: 'Morocco',
  })
  country: string;

  @ApiProperty({
    description: 'Office registration date',
    example: '2024-01-15T10:30:00Z',
  })
  registrationDate: Date;

  @ApiProperty({
    description: 'Office status from requests or ACCEPTED if not available',
    example: 'ACCEPTED',
    enum: ['REQUESTED', 'ON_HOLD', 'ACCEPTED', 'REJECTED'],
  })
  status: string;

  @ApiProperty({
    description: 'Duration on platform in days',
    example: 45,
  })
  duration: number;
}

export class AboutOfficesResponse {
  @ApiProperty({
    description: 'Array of office data',
    type: [AboutOfficeData],
  })
  data: AboutOfficeData[];

  @ApiProperty({
    description: 'Total number of offices matching filters',
    example: 150,
  })
  totalOffices: number;

  @ApiProperty({
    description: 'Number of offices returned in current page',
    example: 10,
  })
  filteredCount: number;

  @ApiProperty({
    description: 'Applied filters summary',
    example: {
      countryId: 'country-uuid',
      cityIds: ['city-uuid-1', 'city-uuid-2'],
      status: 'ACCEPTED',
      duration: 'LAST_1_MONTH',
      search: 'Exchange',
    },
  })
  appliedFilters: {
    countryId?: string;
    cityIds?: string[];
    status?: string;
    duration?: string;
    search?: string;
  };

  @ApiProperty({
    description: 'Pagination information',
    example: {
      currentPage: 1,
      pageSize: 10,
      totalPages: 15,
      totalItems: 150,
      hasNextPage: true,
      hasPreviousPage: false,
    },
  })
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
