import { Module } from '@nestjs/common';
import { GpsClickRepository } from '../gps-click.repository';
import { GpsClickRelationalRepository } from './repositories/gps-click.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GpsClickEntity } from './entities/gps-click.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GpsClickEntity])],
  providers: [
    {
      provide: GpsClickRepository,
      useClass: GpsClickRelationalRepository,
    },
  ],
  exports: [GpsClickRepository],
})
export class RelationalGpsClickPersistenceModule {}
