import {
  // common
  Module,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CitiesController } from './cities.controller';
import { RelationalCityPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

import { CountriesModule } from 'src/countries/countries.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalCityPersistenceModule,
    CountriesModule,
  ],
  controllers: [CitiesController],
  providers: [CitiesService],
  exports: [CitiesService, RelationalCityPersistenceModule],
})
export class CitiesModule {}
