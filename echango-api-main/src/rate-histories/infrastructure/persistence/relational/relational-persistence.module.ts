import { Module } from '@nestjs/common';
import { RateHistoryRepository } from '../rate-history.repository';
import { RateHistoryRelationalRepository } from './repositories/rate-history.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateHistoryEntity } from './entities/rate-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RateHistoryEntity])],
  providers: [
    {
      provide: RateHistoryRepository,
      useClass: RateHistoryRelationalRepository,
    },
  ],
  exports: [RateHistoryRepository],
})
export class RelationalRateHistoryPersistenceModule {}
