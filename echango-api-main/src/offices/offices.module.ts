import {
  // common
  Module,
} from '@nestjs/common';
import { OfficesService } from './offices.service';
import { OfficesController } from './offices.controller';
import { RelationalOfficePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { CitiesModule } from '../cities/cities.module';
import { CountriesModule } from '../countries/countries.module';
import { CurrenciesModule } from '../currencies/currencies.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalOfficePersistenceModule,
    CitiesModule,
    CountriesModule,
    CurrenciesModule,
    FilesModule,
  ],
  controllers: [OfficesController],
  providers: [OfficesService],
  exports: [OfficesService, RelationalOfficePersistenceModule],
})
export class OfficesModule {}
