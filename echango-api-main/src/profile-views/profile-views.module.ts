import {
  // common
  Module,
} from '@nestjs/common';
import { ProfileViewsService } from './profile-views.service';
import { ProfileViewsController } from './profile-views.controller';
import { RelationalProfileViewPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { OfficesModule } from '../offices/offices.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalProfileViewPersistenceModule,
    OfficesModule,
    UsersModule,
  ],
  controllers: [ProfileViewsController],
  providers: [ProfileViewsService],
  exports: [ProfileViewsService, RelationalProfileViewPersistenceModule],
})
export class ProfileViewsModule {}
