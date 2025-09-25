import { Module } from '@nestjs/common';
import { AlertRepository } from '../alert.repository';
import { AlertRelationalRepository } from './repositories/alert.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertEntity } from './entities/alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlertEntity])],
  providers: [
    {
      provide: AlertRepository,
      useClass: AlertRelationalRepository,
    },
  ],
  exports: [AlertRepository],
})
export class RelationalAlertPersistenceModule {}
