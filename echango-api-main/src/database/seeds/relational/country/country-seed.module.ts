import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryEntity } from '../../../../countries/infrastructure/persistence/relational/entities/country.entity';
import { CountrySeedService } from './country-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([CountryEntity])],
  providers: [CountrySeedService],
  exports: [CountrySeedService],
})
export class CountrySeedModule {}
