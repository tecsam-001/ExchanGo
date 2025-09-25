import { Office } from 'src/offices/domain/office';
import { Currency } from 'src/currencies/domain/currency';

export class RateUpdateEvent {
  constructor(
    public office: Office,
    public targetCurrency: Currency,
    public baseCurrency: Currency,
    public oldBuyRate: number,
    public oldSellRate: number,
    public newBuyRate: number,
    public newSellRate: number,
    public isActive: boolean,
  ) {}
}
