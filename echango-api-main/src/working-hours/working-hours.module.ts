import {
  // common
  Module,
} from '@nestjs/common';
import { WorkingHoursService } from './working-hours.service';
import { WorkingHoursController } from './working-hours.controller';
import { RelationalWorkingHourPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { OfficesModule } from '../offices/offices.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalWorkingHourPersistenceModule,
    OfficesModule,
  ],
  controllers: [WorkingHoursController],
  providers: [WorkingHoursService],
  exports: [WorkingHoursService, RelationalWorkingHourPersistenceModule],
})
export class WorkingHoursModule {}
