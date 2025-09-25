import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Office } from 'src/offices/domain/office';
import { Currency } from 'src/currencies/domain/currency';

export class RateHistoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  office: Office;

  @ApiProperty()
  @IsNotEmpty()
  targetCurrency: Currency;

  @ApiProperty()
  @IsNotEmpty()
  baseCurrency: Currency;

  @ApiProperty()
  @IsNotEmpty()
  oldBuyRate: number;

  @ApiProperty()
  oldSellRate: number;

  @ApiProperty()
  @IsNotEmpty()
  newBuyRate: number;

  @ApiProperty()
  @IsNotEmpty()
  newSellRate: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
