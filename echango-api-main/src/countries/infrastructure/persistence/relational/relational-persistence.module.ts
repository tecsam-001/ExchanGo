import { Module } from '@nestjs/common';
import { CountryRepository } from '../country.repository';
import { CountryRelationalRepository } from './repositories/country.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryEntity } from './entities/country.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CountryEntity])],
  providers: [
    {
      provide: CountryRepository,
      useClass: CountryRelationalRepository,
    },
  ],
  exports: [CountryRepository],
})
export class RelationalCountryPersistenceModule {}
