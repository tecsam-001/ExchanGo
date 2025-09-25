import { Module } from '@nestjs/common';
import { OfficeRepository } from '../office.repository';
import { OfficeRelationalRepository } from './repositories/office.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficeEntity } from './entities/office.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OfficeEntity])],
  providers: [
    {
      provide: OfficeRepository,
      useClass: OfficeRelationalRepository,
    },
  ],
  exports: [OfficeRepository],
})
export class RelationalOfficePersistenceModule {}
