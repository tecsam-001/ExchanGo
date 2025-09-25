import {
  // common
  Module,
} from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';
import { RelationalCurrencyPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalCurrencyPersistenceModule,
  ],
  controllers: [CurrenciesController],
  providers: [CurrenciesService],
  exports: [CurrenciesService, RelationalCurrencyPersistenceModule],
})
export class CurrenciesModule {}
