import { RateHistory } from '../../../../domain/rate-history';
import { RateHistoryEntity } from '../entities/rate-history.entity';
import { OfficeMapper } from 'src/offices/infrastructure/persistence/relational/mappers/office.mapper';
import { CurrencyMapper } from 'src/currencies/infrastructure/persistence/relational/mappers/currency.mapper';
import { OfficeEntity } from 'src/offices/infrastructure/persistence/relational/entities/office.entity';
import { CurrencyEntity } from 'src/currencies/infrastructure/persistence/relational/entities/currency.entity';

export class RateHistoryMapper {
  static toDomain(raw: RateHistoryEntity): RateHistory {
    const domainEntity = new RateHistory();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.office = OfficeMapper.toDomain(raw.office);
    domainEntity.targetCurrency = CurrencyMapper.toDomain(raw.targetCurrency);
    domainEntity.baseCurrency = CurrencyMapper.toDomain(raw.baseCurrency);
    domainEntity.oldBuyRate = raw.oldBuyRate;
    domainEntity.oldSellRate = raw.oldSellRate;
    domainEntity.newBuyRate = raw.newBuyRate;
    domainEntity.newSellRate = raw.newSellRate;
    domainEntity.isActive = raw.isActive;
    return domainEntity;
  }

  static toPersistence(domainEntity: RateHistory): RateHistoryEntity {
    let office: OfficeEntity | undefined = undefined;
    let targetCurrency: CurrencyEntity | undefined = undefined;
    let baseCurrency: CurrencyEntity | undefined = undefined;

    if (domainEntity.office) {
      office = OfficeMapper.toPersistence(domainEntity.office);
    }
    if (domainEntity.targetCurrency) {
      targetCurrency = CurrencyMapper.toPersistence(
        domainEntity.targetCurrency,
      );
    }
    if (domainEntity.baseCurrency) {
      baseCurrency = CurrencyMapper.toPersistence(domainEntity.baseCurrency);
    }

    const persistenceEntity = new RateHistoryEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.office = office as OfficeEntity;
    persistenceEntity.targetCurrency = targetCurrency as CurrencyEntity;
    persistenceEntity.baseCurrency = baseCurrency as CurrencyEntity;
    persistenceEntity.oldBuyRate = domainEntity.oldBuyRate;
    persistenceEntity.oldSellRate = domainEntity.oldSellRate;
    persistenceEntity.newBuyRate = domainEntity.newBuyRate;
    persistenceEntity.newSellRate = domainEntity.newSellRate;
    persistenceEntity.isActive = domainEntity.isActive;
    return persistenceEntity;
  }
}
