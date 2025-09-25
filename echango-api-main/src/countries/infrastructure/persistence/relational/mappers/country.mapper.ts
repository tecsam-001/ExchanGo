import { Country } from '../../../../domain/country';
import { CountryEntity } from '../entities/country.entity';

export class CountryMapper {
  static toDomain(raw: CountryEntity): Country {
    const domainEntity = new Country();
    domainEntity.id = raw.id;
    domainEntity.name = raw.name;
    domainEntity.unicode = raw.unicode;
    domainEntity.emoji = raw.emoji;
    domainEntity.alpha2 = raw.alpha2;
    domainEntity.dialCode = raw.dialCode;
    domainEntity.region = raw.region;
    domainEntity.capital = raw.capital;
    domainEntity.alpha3 = raw.alpha3;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Country): CountryEntity {
    const persistenceEntity = new CountryEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.unicode = domainEntity.unicode;
    persistenceEntity.emoji = domainEntity.emoji;
    persistenceEntity.alpha2 = domainEntity.alpha2;
    persistenceEntity.dialCode = domainEntity.dialCode;
    persistenceEntity.region = domainEntity.region;
    persistenceEntity.capital = domainEntity.capital;
    persistenceEntity.alpha3 = domainEntity.alpha3;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
