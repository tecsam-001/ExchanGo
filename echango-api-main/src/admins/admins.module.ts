import {
  // common
  Module,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { OfficesModule } from '../offices/offices.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AlertsModule } from '../alerts/alerts.module';
import { RateHistoriesModule } from '../rate-histories/rate-histories.module';
import { ProfileViewsModule } from '../profile-views/profile-views.module';
import { PhoneCallsModule } from '../phone-calls/phone-calls.module';
import { GpsClicksModule } from '../gps-clicks/gps-clicks.module';
import { CitiesModule } from '../cities/cities.module';
import { RequestsModule } from '../requests/requests.module';

@Module({
  imports: [
    // import modules, etc.
    OfficesModule,
    AnalyticsModule,
    AlertsModule,
    RateHistoriesModule,
    ProfileViewsModule,
    PhoneCallsModule,
    GpsClicksModule,
    CitiesModule,
    RequestsModule,
  ],
  controllers: [AdminsController],
  providers: [AdminsService],
  exports: [AdminsService],
})
export class AdminsModule {}
