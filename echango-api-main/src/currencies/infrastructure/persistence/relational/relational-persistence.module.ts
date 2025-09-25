import { Module } from '@nestjs/common';
import { CurrencyRepository } from '../currency.repository';
import { CurrencyRelationalRepository } from './repositories/currency.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CurrencyEntity } from './entities/currency.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyEntity])],
  providers: [
    {
      provide: CurrencyRepository,
      useClass: CurrencyRelationalRepository,
    },
  ],
  exports: [CurrencyRepository],
})
export class RelationalCurrencyPersistenceModule {}
