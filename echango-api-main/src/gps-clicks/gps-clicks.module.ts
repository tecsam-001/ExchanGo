import {
  // common
  Module,
} from '@nestjs/common';
import { GpsClicksService } from './gps-clicks.service';
import { GpsClicksController } from './gps-clicks.controller';
import { RelationalGpsClickPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { OfficesModule } from '../offices/offices.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalGpsClickPersistenceModule,
    OfficesModule,
    UsersModule,
  ],
  controllers: [GpsClicksController],
  providers: [GpsClicksService],
  exports: [GpsClicksService, RelationalGpsClickPersistenceModule],
})
export class GpsClicksModule {}
