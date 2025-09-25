import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  Min,
  Max,
} from 'class-validator';

export enum SortBy {
  CITY_NAME = 'cityName',
  OFFICE_COUNT = 'officeCount',
  NEWEST_OFFICE = 'newestOffice',
  MOST_VERIFIED = 'mostVerified',
  MOST_FEATURED = 'mostFeatured',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class SearchCitiesWithOfficesDto {
  @ApiProperty({
    description: 'Search query for city names',
    example: 'Casa',
    type: String,
  })
  @IsString()
  query: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    type: Number,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sort results by',
    enum: SortBy,
    example: SortBy.OFFICE_COUNT,
  })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.OFFICE_COUNT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    description: 'Minimum number of offices in city',
    example: 1,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  minOffices?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of offices in city',
    example: 100,
    type: Number,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @Min(1)
  maxOffices?: number;

  @ApiPropertyOptional({
    description: 'Include only cities with active offices',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  onlyActiveOffices?: boolean;

  @ApiPropertyOptional({
    description: 'Include only cities with verified offices',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  onlyVerifiedOffices?: boolean;

  @ApiPropertyOptional({
    description: 'Include only cities with featured offices',
    example: false,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  onlyFeaturedOffices?: boolean;

  @ApiPropertyOptional({
    description: 'Include detailed office information',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  includeOfficeDetails?: boolean = false;

  @ApiPropertyOptional({
    description: 'Filter by specific currency availability',
    example: ['USD', 'EUR'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
    return Array.isArray(value) ? value : [];
  })
  availableCurrencies?: string[];

  @ApiPropertyOptional({
    description: 'Include statistics about offices in each city',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  @IsBoolean()
  includeStatistics?: boolean = true;
}
