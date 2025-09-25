import { OfficeRate } from '../../../../domain/office-rate';
import { OfficeRateEntity } from '../entities/office-rate.entity';
import { OfficeEntity } from 'src/offices/infrastructure/persistence/relational/entities/office.entity';
import { CurrencyEntity } from 'src/currencies/infrastructure/persistence/relational/entities/currency.entity';
import { OfficeMapper } from 'src/offices/infrastructure/persistence/relational/mappers/office.mapper';
import { CurrencyMapper } from 'src/currencies/infrastructure/persistence/relational/mappers/currency.mapper';

export class OfficeRateMapper {
  static toDomain(raw: OfficeRateEntity): OfficeRate {
    const domainEntity = new OfficeRate();
    domainEntity.id = raw.id;
    if (raw.office) {
      domainEntity.office = OfficeMapper.toDomain(raw.office);
    }
    if (raw.baseCurrency) {
      domainEntity.baseCurrency = CurrencyMapper.toDomain(raw.baseCurrency);
    }
    if (raw.targetCurrency) {
      domainEntity.targetCurrency = CurrencyMapper.toDomain(raw.targetCurrency);
    }
    domainEntity.buyRate = raw.buyRate;
    domainEntity.sellRate = raw.sellRate;
    domainEntity.isActive = raw.isActive;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: OfficeRate): OfficeRateEntity {
    let office: OfficeEntity | undefined = undefined;

    if (domainEntity.office) {
      office = new OfficeEntity();
      office.id = domainEntity.office.id;
    }

    let baseCurrency: CurrencyEntity | undefined = undefined;

    if (domainEntity.baseCurrency) {
      baseCurrency = new CurrencyEntity();
      baseCurrency.id = domainEntity.baseCurrency.id;
    }

    let targetCurrency: CurrencyEntity | undefined = undefined;

    if (domainEntity.targetCurrency) {
      targetCurrency = new CurrencyEntity();
      targetCurrency.id = domainEntity.targetCurrency.id;
    }

    const persistenceEntity = new OfficeRateEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.office = office as OfficeEntity;
    persistenceEntity.baseCurrency = baseCurrency as CurrencyEntity;
    persistenceEntity.targetCurrency = targetCurrency as CurrencyEntity;
    persistenceEntity.buyRate = domainEntity.buyRate;
    persistenceEntity.sellRate = domainEntity.sellRate;
    persistenceEntity.isActive = domainEntity.isActive;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
