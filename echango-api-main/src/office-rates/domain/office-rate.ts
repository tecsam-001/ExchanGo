import { ApiProperty } from '@nestjs/swagger';
import { Office } from 'src/offices/domain/office';
import { Currency } from 'src/currencies/domain/currency';

export class OfficeRate {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: Office,
  })
  office: Office;

  @ApiProperty({
    type: Number,
  })
  buyRate: number;

  @ApiProperty({
    type: Number,
  })
  sellRate: number;

  @ApiProperty({
    type: Currency,
  })
  baseCurrency: Currency;

  @ApiProperty({
    type: Currency,
  })
  targetCurrency: Currency;

  @ApiProperty({
    type: Boolean,
  })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt?: Date | null;

  @ApiProperty()
  buyRateEquivalent?: number;

  @ApiProperty()
  sellRateEquivalent?: number;

  @ApiProperty()
  equivalentValue?: number;
}
