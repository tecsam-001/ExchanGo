import {
  // common
  Module,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { RequestsController } from './requests.controller';
import { RelationalRequestPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { OfficesModule } from 'src/offices/offices.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalRequestPersistenceModule,
    OfficesModule,
    MailModule,
  ],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService, RelationalRequestPersistenceModule],
})
export class RequestsModule {}
