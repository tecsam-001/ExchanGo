import { City } from '../../../../domain/city';
import { CityEntity } from '../entities/city.entity';
import { CountryMapper } from '../../../../../countries/infrastructure/persistence/relational/mappers/country.mapper';
import { CountryEntity } from '../../../../../countries/infrastructure/persistence/relational/entities/country.entity';

export class CityMapper {
  static toDomain(raw: CityEntity): City {
    const domainEntity = new City();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    if (raw.country) {
      domainEntity.country = CountryMapper.toDomain(raw.country);
    }
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: City): CityEntity {
    let country: CountryEntity | undefined | null = undefined;

    if (domainEntity.country) {
      country = CountryMapper.toPersistence(domainEntity.country);
    } else if (domainEntity.country === null) {
      country = null;
    }

    const persistenceEntity = new CityEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.country = country;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
