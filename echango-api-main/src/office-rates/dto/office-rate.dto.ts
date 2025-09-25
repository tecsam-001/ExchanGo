import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Office } from 'src/offices/domain/office';
import { Currency } from 'src/currencies/domain/currency';

export class OfficeRateDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  office: Office;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  baseCurrency: Currency;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  targetCurrency: Currency;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  buyRate: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sellRate: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  @ApiProperty()
  @IsDate()
  @IsOptional()
  deletedAt?: Date | null;
}
