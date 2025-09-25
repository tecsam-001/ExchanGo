import {
  // common
  Module,
} from '@nestjs/common';
import { OfficeRatesService } from './office-rates.service';
import { OfficeRatesController } from './office-rates.controller';
import { RelationalOfficeRatePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { OfficesModule } from 'src/offices/offices.module';
import { CurrenciesModule } from 'src/currencies/currencies.module';
import { RateHistoriesModule } from 'src/rate-histories/rate-histories.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalOfficeRatePersistenceModule,
    OfficesModule,
    CurrenciesModule,
    RateHistoriesModule,
  ],
  controllers: [OfficeRatesController],
  providers: [OfficeRatesService],
  exports: [OfficeRatesService, RelationalOfficeRatePersistenceModule],
})
export class OfficeRatesModule {}
