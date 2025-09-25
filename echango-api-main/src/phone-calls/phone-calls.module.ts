import {
  // common
  Module,
} from '@nestjs/common';
import { PhoneCallsService } from './phone-calls.service';
import { PhoneCallsController } from './phone-calls.controller';
import { RelationalPhoneCallPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { OfficesModule } from '../offices/offices.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalPhoneCallPersistenceModule,
    OfficesModule,
    UsersModule,
  ],
  controllers: [PhoneCallsController],
  providers: [PhoneCallsService],
  exports: [PhoneCallsService, RelationalPhoneCallPersistenceModule],
})
export class PhoneCallsModule {}
