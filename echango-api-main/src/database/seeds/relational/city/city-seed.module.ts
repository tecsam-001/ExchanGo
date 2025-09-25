import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityEntity } from '../../../../cities/infrastructure/persistence/relational/entities/city.entity';
import { CountryEntity } from '../../../../countries/infrastructure/persistence/relational/entities/country.entity';
import { CitySeedService } from './city-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([CityEntity, CountryEntity])],
  providers: [CitySeedService],
  exports: [CitySeedService],
})
export class CitySeedModule {}
