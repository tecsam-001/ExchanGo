import { ApiPropertyOptional } from '@nestjs/swagger';
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

export enum OfficeSortBy {
  NAME = 'name',
  NEWEST = 'newest',
  VERIFIED = 'verified',
  FEATURED = 'featured',
  POPULAR = 'popular',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum RateDirection {
  BUY = 'BUY',
  SELL = 'SELL',
}

export class GetOfficesInCityDto {
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
    example: 12,
    type: Number,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : 12))
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 12;

  @ApiPropertyOptional({
    description: 'Filter by active status',
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
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by verified status',
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
  isVerified?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by featured status',
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
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by available currencies (comma-separated)',
    example: 'USD,EUR,GBP',
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
    return Array.isArray(value) ? value : [];
  })
  @IsArray()
  @IsString({ each: true })
  availableCurrencies?: string[];

  @ApiPropertyOptional({
    description: 'Show only currently open offices',
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
  showOnlyOpenNow?: boolean;

  @ApiPropertyOptional({
    description: 'Sort offices by',
    enum: OfficeSortBy,
    example: OfficeSortBy.POPULAR,
  })
  @IsOptional()
  @IsEnum(OfficeSortBy)
  sortBy?: OfficeSortBy;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    example: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;

  // Currency conversion parameters
  @ApiPropertyOptional({
    description: 'Base currency code for conversion (e.g., MAD, USD)',
    example: 'MAD',
    type: String,
  })
  @IsOptional()
  @IsString()
  baseCurrency?: string;

  @ApiPropertyOptional({
    description: 'Target currency code for conversion (e.g., USD, EUR)',
    example: 'USD',
    type: String,
  })
  @IsOptional()
  @IsString()
  targetCurrency?: string;

  @ApiPropertyOptional({
    description: 'Amount in target currency to calculate equivalent value',
    example: 100,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  targetCurrencyRate?: number;

  @ApiPropertyOptional({
    description:
      'Rate direction for conversion (BUY or SELL). Auto-determined if not provided.',
    enum: RateDirection,
    example: RateDirection.BUY,
  })
  @IsOptional()
  @IsEnum(RateDirection)
  rateDirection?: RateDirection;
}
