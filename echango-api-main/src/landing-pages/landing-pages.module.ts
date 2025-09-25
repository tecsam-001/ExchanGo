import { OfficeRatesModule } from './../office-rates/office-rates.module';
import {
  // common
  Module,
} from '@nestjs/common';
import { LandingPagesService } from './landing-pages.service';
import { LandingPagesController } from './landing-pages.controller';

@Module({
  imports: [
    // import modules, etc.
    OfficeRatesModule,
  ],
  controllers: [LandingPagesController],
  providers: [LandingPagesService],
  exports: [LandingPagesService],
})
export class LandingPagesModule {}
