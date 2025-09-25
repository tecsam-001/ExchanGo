import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

enum TrendFilter {
  FEATURED = 'featured',
  VERIFIED = 'verified',
  NEWEST = 'newest',
}

export class SearchOfficesByCityDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    type: Number,
    minimum: 1,
    maximum: 50,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  // Currency filters
  @ApiPropertyOptional({
    description: 'Filter by available currencies (comma-separated or array)',
    example: 'USD,EUR,GBP',
    type: [String],
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

  // Trend filters
  @ApiPropertyOptional({
    description: 'Filter by trend type',
    enum: TrendFilter,
    example: TrendFilter.FEATURED,
  })
  @IsOptional()
  @IsEnum(TrendFilter)
  trend?: TrendFilter;

  // Office hour filter
  @ApiPropertyOptional({
    description: 'Show only currently open offices',
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
  showOnlyOpenNow?: boolean;

  // Currency conversion parameters
  @ApiPropertyOptional({
    description: 'Base currency for conversion',
    example: 'MAD',
    type: String,
  })
  @IsOptional()
  @IsString()
  baseCurrency?: string;

  @ApiPropertyOptional({
    description: 'Target currency for conversion',
    example: 'USD',
    type: String,
  })
  @IsOptional()
  @IsString()
  targetCurrency?: string;

  @ApiPropertyOptional({
    description: 'Target currency rate for conversion',
    example: 10.5,
    type: Number,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  @IsNumber()
  @Min(0)
  targetCurrencyRate?: number;

  // Additional office filters
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
}
