import { Alert } from '../../../../domain/alert';
import { AlertEntity } from '../entities/alert.entity';
import { CityMapper } from 'src/cities/infrastructure/persistence/relational/mappers/city.mapper';
import { OfficeMapper } from 'src/offices/infrastructure/persistence/relational/mappers/office.mapper';
import { CurrencyMapper } from 'src/currencies/infrastructure/persistence/relational/mappers/currency.mapper';
import { UserMapper } from 'src/users/infrastructure/persistence/relational/mappers/user.mapper';
import { CityEntity } from '../../../../../cities/infrastructure/persistence/relational/entities/city.entity';
import { OfficeEntity } from '../../../../../offices/infrastructure/persistence/relational/entities/office.entity';
import { CurrencyEntity } from '../../../../../currencies/infrastructure/persistence/relational/entities/currency.entity';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

export class AlertMapper {
  static toDomain(raw: AlertEntity): Alert {
    const domainEntity = new Alert();
    domainEntity.id = raw.id;
    domainEntity.triggerType = raw.triggerType;
    domainEntity.whatsAppNumber = raw.whatsAppNumber;
    if (raw.cities) {
      domainEntity.cities = raw.cities.map((city) => CityMapper.toDomain(city));
    }
    if (raw.offices) {
      domainEntity.offices = raw.offices.map((office) =>
        OfficeMapper.toDomain(office),
      );
    }
    if (raw.currency) {
      domainEntity.currency = CurrencyMapper.toDomain(raw.currency);
    }
    if (raw.user) {
      domainEntity.user = UserMapper.toDomain(raw.user);
    }
    domainEntity.baseCurrencyAmount = raw.baseCurrencyAmount;
    domainEntity.targetCurrencyAmount = raw.targetCurrencyAmount;
    domainEntity.targetCurrency = raw.targetCurrency;
    domainEntity.isActive = raw.isActive;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Alert): AlertEntity {
    let cities: CityEntity[] = [];
    let offices: OfficeEntity[] = [];
    let currency: CurrencyEntity | null = null;
    let user: UserEntity | null = null;
    let targetCurrency: CurrencyEntity | null = null;

    if (domainEntity.cities) {
      cities = domainEntity.cities.map((city) =>
        CityMapper.toPersistence(city),
      );
    }
    if (domainEntity.offices) {
      offices = domainEntity.offices.map((office) =>
        OfficeMapper.toPersistence(office),
      );
    }
    if (domainEntity.currency) {
      currency = CurrencyMapper.toPersistence(domainEntity.currency);
    }
    if (domainEntity.user) {
      user = UserMapper.toPersistence(domainEntity.user);
    }
    if (domainEntity.targetCurrency) {
      targetCurrency = CurrencyMapper.toPersistence(
        domainEntity.targetCurrency,
      );
    }

    const persistenceEntity = new AlertEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.triggerType = domainEntity.triggerType;
    persistenceEntity.whatsAppNumber = domainEntity.whatsAppNumber;
    persistenceEntity.cities = cities;
    persistenceEntity.offices = offices;
    persistenceEntity.currency = currency as CurrencyEntity;
    persistenceEntity.user = user;
    persistenceEntity.baseCurrencyAmount = domainEntity.baseCurrencyAmount;
    persistenceEntity.targetCurrencyAmount = domainEntity.targetCurrencyAmount;
    persistenceEntity.targetCurrency = targetCurrency as CurrencyEntity;
    persistenceEntity.isActive = domainEntity.isActive;

    return persistenceEntity;
  }
}
