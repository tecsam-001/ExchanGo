import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  // decorators here
  Transform,
} from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Helper function to properly transform boolean values from query parameters
const transformBoolean = ({ value }: { value: any }) => {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
};

export class FindNearbyOfficesDto {
  @ApiProperty({ example: 36.778259, type: Number })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  latitude: number;

  @ApiProperty({ example: 36.778259, type: Number })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  longitude: number;

  @ApiProperty({ example: 10, type: Number })
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  radiusInKm: number;

  @ApiPropertyOptional({ example: true, type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(transformBoolean)
  nearest?: boolean;

  @ApiPropertyOptional({ example: 'USD', type: String })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  targetCurrency?: string;

  // rateDirection is automatically determined based on which currency is MAD
  // No need to expose this parameter in the API

  @ApiPropertyOptional({ example: 1, type: Number })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  targetCurrencyRate?: number;

  @ApiPropertyOptional({ example: ['USD', 'EUR'], type: [String] })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      // If already an array (multiple query params), return as is
      return value.map((v) => String(v).trim()).filter((v) => v.length > 0);
    }
    if (typeof value === 'string') {
      // If string (comma-separated), split and trim
      return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
    }
    return [];
  })
  availableCurrencies?: string[];

  @ApiPropertyOptional({ example: 'MAD', type: String })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  baseCurrency?: string;

  @ApiPropertyOptional({ example: true, type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(transformBoolean)
  isOpen?: boolean;

  @ApiPropertyOptional({ example: true, type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(transformBoolean)
  isPopular?: boolean;

  @ApiPropertyOptional({ example: true, type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(transformBoolean)
  mostSearched?: boolean;

  @ApiPropertyOptional({ example: true, type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(transformBoolean)
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: true, type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(transformBoolean)
  isVerified?: boolean;

  @ApiPropertyOptional({ example: true, type: Boolean })
  @IsOptional()
  @IsBoolean()
  @Transform(transformBoolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    example: true,
    type: Boolean,
    description:
      'Show only offices that are currently open based on working hours',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(transformBoolean)
  showOnlyOpenNow?: boolean;

  @ApiPropertyOptional({ example: 10, type: Number })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  limit?: number;

  @ApiPropertyOptional({ example: 1, type: Number })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  page?: number;
}
