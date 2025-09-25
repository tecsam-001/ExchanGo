import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export enum DurationFilter {
  ALL_TIME = 'ALL_TIME',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_1_MONTH = 'LAST_1_MONTH',
  LAST_6_MONTHS = 'LAST_6_MONTHS',
}

export enum StatusFilter {
  REQUESTED = 'REQUESTED',
  ON_HOLD = 'ON_HOLD',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export class AboutOfficesDto {
  @ApiPropertyOptional({
    description: 'Filter by country ID',
    example: 'country-uuid',
  })
  @IsOptional()
  @IsString()
  countryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by multiple city IDs (comma-separated)',
    example: 'city-uuid-1,city-uuid-2',
  })
  @IsOptional()
  @IsString()
  cityIds?: string;

  @ApiPropertyOptional({
    description: 'Filter by office status',
    enum: StatusFilter,
    example: StatusFilter.ACCEPTED,
  })
  @IsOptional()
  @IsEnum(StatusFilter)
  status?: StatusFilter;

  @ApiPropertyOptional({
    description: 'Filter by duration on platform',
    enum: DurationFilter,
    example: DurationFilter.LAST_1_MONTH,
  })
  @IsOptional()
  @IsEnum(DurationFilter)
  duration?: DurationFilter;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({
    description: 'Search term for office name or city',
    example: 'Exchange Office',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
