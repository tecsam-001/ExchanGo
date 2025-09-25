import { Module } from '@nestjs/common';
import { PhoneCallRepository } from '../phone-call.repository';
import { PhoneCallRelationalRepository } from './repositories/phone-call.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhoneCallEntity } from './entities/phone-call.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PhoneCallEntity])],
  providers: [
    {
      provide: PhoneCallRepository,
      useClass: PhoneCallRelationalRepository,
    },
  ],
  exports: [PhoneCallRepository],
})
export class RelationalPhoneCallPersistenceModule {}
