import { Module } from '@nestjs/common';
import { RequestRepository } from '../request.repository';
import { RequestRelationalRepository } from './repositories/request.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestEntity } from './entities/request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RequestEntity])],
  providers: [
    {
      provide: RequestRepository,
      useClass: RequestRelationalRepository,
    },
  ],
  exports: [RequestRepository],
})
export class RelationalRequestPersistenceModule {}
