import {
  // common
  Module,
} from '@nestjs/common';
import { RateHistoriesService } from './rate-histories.service';
import { RateHistoriesController } from './rate-histories.controller';
import { RelationalRateHistoryPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { OfficesModule } from 'src/offices/offices.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalRateHistoryPersistenceModule,
    OfficesModule,
  ],
  controllers: [RateHistoriesController],
  providers: [RateHistoriesService],
  exports: [RateHistoriesService, RelationalRateHistoryPersistenceModule],
})
export class RateHistoriesModule {}
