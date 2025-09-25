import { Module } from '@nestjs/common';
import { WorkingHourRepository } from '../working-hour.repository';
import { WorkingHourRelationalRepository } from './repositories/working-hour.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkingHourEntity } from './entities/working-hour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkingHourEntity])],
  providers: [
    {
      provide: WorkingHourRepository,
      useClass: WorkingHourRelationalRepository,
    },
  ],
  exports: [WorkingHourRepository],
})
export class RelationalWorkingHourPersistenceModule {}
