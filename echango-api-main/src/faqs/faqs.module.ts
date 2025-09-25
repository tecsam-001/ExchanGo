import {
  // common
  Module,
} from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';
import { RelationalFaqPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { OfficesModule } from 'src/offices/offices.module';

@Module({
  imports: [
    // import modules, etc.
    RelationalFaqPersistenceModule,
    OfficesModule,
  ],
  controllers: [FaqsController],
  providers: [FaqsService],
  exports: [FaqsService, RelationalFaqPersistenceModule],
})
export class FaqsModule {}
