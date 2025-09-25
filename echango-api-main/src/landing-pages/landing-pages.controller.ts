import { Controller, Get, Query } from '@nestjs/common';
import { LandingPagesService } from './landing-pages.service';
import { CityRankingDto } from './dto/city-ranking-dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Landingpages')
@Controller({
  path: 'landing-pages',
  version: '1',
})
export class LandingPagesController {
  constructor(private readonly landingPagesService: LandingPagesService) {}

  @Get('city-ranking')
  async getCityRankingForExchangeRates(@Query() dto: CityRankingDto) {
    return this.landingPagesService.getCityRankingForExchangeRates(dto);
  }
}
