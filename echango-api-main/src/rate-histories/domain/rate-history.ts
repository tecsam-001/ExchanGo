import { ApiProperty } from '@nestjs/swagger';
import { Office } from 'src/offices/domain/office';
import { Currency } from 'src/currencies/domain/currency';

export class RateHistory {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  office: Office;

  @ApiProperty()
  targetCurrency: Currency;

  @ApiProperty()
  baseCurrency: Currency;

  @ApiProperty()
  oldBuyRate: number;

  @ApiProperty()
  oldSellRate: number;

  @ApiProperty()
  newBuyRate: number;

  @ApiProperty()
  newSellRate: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
