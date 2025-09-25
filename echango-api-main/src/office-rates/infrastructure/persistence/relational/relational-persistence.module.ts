import { Module } from '@nestjs/common';
import { OfficeRateRepository } from '../office-rate.repository';
import { OfficeRateRelationalRepository } from './repositories/office-rate.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficeRateEntity } from './entities/office-rate.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OfficeRateEntity])],
  providers: [
    {
      provide: OfficeRateRepository,
      useClass: OfficeRateRelationalRepository,
    },
  ],
  exports: [OfficeRateRepository],
})
export class RelationalOfficeRatePersistenceModule {}
