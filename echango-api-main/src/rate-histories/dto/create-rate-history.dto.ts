import { Office } from 'src/offices/domain/office';
import { Currency } from 'src/currencies/domain/currency';
import { IsNotEmpty, IsNumber, IsBoolean } from 'class-validator';

export class CreateRateHistoryDto {
  // Don't forget to use the class-validator decorators in the DTO properties.
  @IsNotEmpty()
  office: Office;

  @IsNotEmpty()
  targetCurrency: Currency;

  @IsNotEmpty()
  baseCurrency: Currency;

  @IsNotEmpty()
  @IsNumber()
  oldBuyRate: number;

  @IsNotEmpty()
  @IsNumber()
  oldSellRate: number;

  @IsNotEmpty()
  @IsNumber()
  newBuyRate: number;

  @IsNotEmpty()
  @IsNumber()
  newSellRate: number;

  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;
}
