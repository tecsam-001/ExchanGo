import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfficeEntity } from '../../../../offices/infrastructure/persistence/relational/entities/office.entity';
import { CSVOfficeSeedService } from './office-seed.service';
import { CSVOfficeFactory } from './office.factory';
import { CityEntity } from '../../../../cities/infrastructure/persistence/relational/entities/city.entity';
import { CountryEntity } from '../../../../countries/infrastructure/persistence/relational/entities/country.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { FileEntity } from '../../../../files/infrastructure/persistence/relational/entities/file.entity';
import { OfficeRateEntity } from '../../../../office-rates/infrastructure/persistence/relational/entities/office-rate.entity';
import { CurrencyEntity } from '../../../../currencies/infrastructure/persistence/relational/entities/currency.entity';
import { WorkingHourEntity } from '../../../../working-hours/infrastructure/persistence/relational/entities/working-hour.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OfficeEntity,
      CityEntity,
      CountryEntity,
      UserEntity,
      FileEntity,
      CurrencyEntity,
      OfficeRateEntity,
      WorkingHourEntity,
    ]),
  ],
  providers: [CSVOfficeSeedService, CSVOfficeFactory],
  exports: [CSVOfficeSeedService],
})
export class OfficeSeedModule {}
