import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CityRankingDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'USD' })
  baseCurrencyCode: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'EUR' })
  targetCurrencyCode: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ example: 1 })
  @Transform(({ value }) => Number(value))
  amount: number;
}
