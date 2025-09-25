import {
  // common
  Module,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ProfileViewsModule } from '../profile-views/profile-views.module';
import { GpsClicksModule } from '../gps-clicks/gps-clicks.module';
import { PhoneCallsModule } from '../phone-calls/phone-calls.module';
import { AlertsModule } from '../alerts/alerts.module';
import { OfficesModule } from '../offices/offices.module';
import { OfficeRatesModule } from '../office-rates/office-rates.module';

@Module({
  imports: [
    // import modules, etc.
    ProfileViewsModule,
    GpsClicksModule,
    PhoneCallsModule,
    AlertsModule,
    OfficesModule,
    OfficeRatesModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
