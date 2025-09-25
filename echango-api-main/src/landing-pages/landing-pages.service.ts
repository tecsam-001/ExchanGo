import {
  // common
  Injectable,
} from '@nestjs/common';
import { OfficeRatesService } from 'src/office-rates/office-rates.service';
import { CityRankingDto } from './dto/city-ranking-dto';
import { CityRankingResult } from 'src/office-rates/types';

@Injectable()
export class LandingPagesService {
  constructor(private readonly officeRatesService: OfficeRatesService) {} // Dependencies here

  async getCityRankingForExchangeRates(
    dto: CityRankingDto,
  ): Promise<CityRankingResult[]> {
    return this.officeRatesService.getCityRankingForExchangeRates({
      baseCurrencyCode: dto.baseCurrencyCode,
      targetCurrencyCode: dto.targetCurrencyCode,
      amount: dto.amount,
    });
  }
}
