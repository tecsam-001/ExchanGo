import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CurrencyRateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'EUR', description: 'Currency code (3 letters)' })
  currency: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 10.3, description: 'Buy rate for the currency' })
  buy: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 10.65, description: 'Sell rate for the currency' })
  sell: number;
}

export class BulkUpdateOfficeRatesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CurrencyRateDto)
  @ApiProperty({
    type: [CurrencyRateDto],
    description: 'Array of currency rates to update',
    example: [
      {
        currency: 'EUR',
        buy: 10.3,
        sell: 10.65,
      },
      {
        currency: 'USD',
        buy: 8.85,
        sell: 9.25,
      },
    ],
  })
  rates: CurrencyRateDto[];

  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    type: [String],
    description: 'Array of office slugs to update',
    example: [
      'change-goulmima-exchange-7j7',
      'el-jadida-cash',
      'saraf-al-inara',
      'change-boulevard-roudani-change-maarif-casablanca',
    ],
  })
  officeSlugs: string[];
}
