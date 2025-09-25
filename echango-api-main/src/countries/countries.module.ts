import {
  // common
  Module,
} from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { RelationalCountryPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalCountryPersistenceModule,
  ],
  controllers: [CountriesController],
  providers: [CountriesService],
  exports: [CountriesService, RelationalCountryPersistenceModule],
})
export class CountriesModule {}
