import {
  // common
  Module,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { RelationalAlertPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { OfficesModule } from 'src/offices/offices.module';
import { CurrenciesModule } from 'src/currencies/currencies.module';
import { UsersModule } from 'src/users/users.module';
import { CitiesModule } from 'src/cities/cities.module';
import { UltraMsgModule } from 'src/ultramsg/ultramsg.module';
import { RateUpdateListener } from './rate-update-event.listener';

@Module({
  imports: [
    // import modules, etc.
    RelationalAlertPersistenceModule,
    OfficesModule,
    CurrenciesModule,
    CitiesModule,
    UsersModule,
    UltraMsgModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService, RateUpdateListener],
  exports: [AlertsService, RelationalAlertPersistenceModule],
})
export class AlertsModule {}
