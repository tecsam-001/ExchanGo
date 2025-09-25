import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './database/config/database.config';
import authConfig from './auth/config/auth.config';
import appConfig from './config/app.config';
import mailConfig from './mail/config/mail.config';
import fileConfig from './files/config/file.config';
import facebookConfig from './auth-facebook/config/facebook.config';
import googleConfig from './auth-google/config/google.config';
import appleConfig from './auth-apple/config/apple.config';
import path from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthAppleModule } from './auth-apple/auth-apple.module';
import { AuthFacebookModule } from './auth-facebook/auth-facebook.module';
import { UltraMsgModule } from './ultramsg/ultramsg.module';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { MailModule } from './mail/mail.module';
import { HomeModule } from './home/home.module';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AllConfigType } from './config/config.type';
import { SessionModule } from './session/session.module';
import { MailerModule } from './mailer/mailer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import { LoggerModule } from './infrastructure/logger/logger.module';
import { DatabaseLoggerService } from './infrastructure/logger/db-logger.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

const infrastructureDatabaseModule = TypeOrmModule.forRootAsync({
  imports: [LoggerModule],
  inject: [DatabaseLoggerService],
  useClass: TypeOrmConfigService,
  dataSourceFactory: async (options: DataSourceOptions) => {
    return new DataSource(options).initialize();
  },
});

import { CurrenciesModule } from './currencies/currencies.module';

import { OfficesModule } from './offices/offices.module';

import { OfficeRatesModule } from './office-rates/office-rates.module';

import { RateHistoriesModule } from './rate-histories/rate-histories.module';

import { AlertsModule } from './alerts/alerts.module';

import { CitiesModule } from './cities/cities.module';

import { CountriesModule } from './countries/countries.module';

import { WorkingHoursModule } from './working-hours/working-hours.module';

import { LandingPagesModule } from './landing-pages/landing-pages.module';

import { FaqsModule } from './faqs/faqs.module';

import { RequestsModule } from './requests/requests.module';

import { AnalyticsModule } from './analytics/analytics.module';

import { ProfileViewsModule } from './profile-views/profile-views.module';

import { PhoneCallsModule } from './phone-calls/phone-calls.module';

import { GpsClicksModule } from './gps-clicks/gps-clicks.module';
import { APP_GUARD } from '@nestjs/core';

import { AdminsModule } from './admins/admins.module';
import { NotificationPreferencesModule } from './notification-preferences/notification-preferences.module';
import { RateUpdateNotificationsModule } from './rate-update-notifications/rate-update-notifications.module';

@Module({
  imports: [
    RequestsModule,
    FaqsModule,
    LandingPagesModule,
    WorkingHoursModule,
    CountriesModule,
    CitiesModule,
    AlertsModule,
    RateHistoriesModule,
    OfficeRatesModule,
    OfficesModule,
    CurrenciesModule,
    CurrenciesModule,
    AnalyticsModule,
    GpsClicksModule,
    PhoneCallsModule,
    ProfileViewsModule,
    UltraMsgModule,
    AdminsModule,
    NotificationPreferencesModule,
    RateUpdateNotificationsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        databaseConfig,
        authConfig,
        appConfig,
        mailConfig,
        fileConfig,
        facebookConfig,
        googleConfig,
        appleConfig,
      ],
      envFilePath: ['.env'],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    infrastructureDatabaseModule,
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService<AllConfigType>) => ({
        fallbackLanguage: configService.getOrThrow('app.fallbackLanguage', {
          infer: true,
        }),
        loaderOptions: { path: path.join(__dirname, '/i18n/'), watch: true },
      }),
      resolvers: [
        {
          use: HeaderResolver,
          useFactory: (configService: ConfigService<AllConfigType>) => {
            return [
              configService.get('app.headerLanguage', {
                infer: true,
              }),
            ];
          },
          inject: [ConfigService],
        },
      ],
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 200000,
        },
      ],
    }),
    UsersModule,
    FilesModule,
    AuthModule,
    AuthFacebookModule,
    AuthGoogleModule,
    AuthAppleModule,
    SessionModule,
    MailModule,
    MailerModule,
    HomeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
