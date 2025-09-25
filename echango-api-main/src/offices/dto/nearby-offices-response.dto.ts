import { ApiProperty } from '@nestjs/swagger';
import { Office } from '../domain/office';

export class NearbyOfficesResponseDto {
  @ApiProperty({
    type: [Office],
    description: 'Array of nearby offices (max 9 per page)',
  })
  offices: Office[];

  @ApiProperty({
    type: Number,
    description: 'Number of offices in the current page',
    example: 9,
  })
  officesInPage: number;

  @ApiProperty({
    type: Number,
    description: 'Total number of offices in the search area',
    example: 25,
  })
  totalOfficesInArea: number;

  @ApiProperty({
    type: Number,
    description: 'Current page number',
    example: 1,
  })
  currentPage: number;

  @ApiProperty({
    type: Number,
    description: 'Total number of pages available',
    example: 3,
  })
  totalPages: number;

  @ApiProperty({
    type: Boolean,
    description: 'Whether there are more pages available',
    example: true,
  })
  hasMore: boolean;
}
