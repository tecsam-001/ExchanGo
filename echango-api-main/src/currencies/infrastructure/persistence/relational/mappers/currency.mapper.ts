import { Currency } from '../../../../domain/currency';
import { CurrencyEntity } from '../entities/currency.entity';

export class CurrencyMapper {
  static toDomain(raw: CurrencyEntity): Currency {
    const domainEntity = new Currency();
    domainEntity.id = raw.id;
    domainEntity.code = raw.code;
    domainEntity.name = raw.name;
    domainEntity.namePlural = raw.namePlural;
    domainEntity.symbol = raw.symbol;
    domainEntity.symbolNative = raw.symbolNative;
    domainEntity.decimalDigits = raw.decimalDigits;
    domainEntity.rounding = raw.rounding;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    if (raw.code) {
      domainEntity.flag = `https://www.xe.com/svgs/flags/${raw.code.toLowerCase()}.static.svg`;
    }

    return domainEntity;
  }

  static toPersistence(domainEntity: Currency): CurrencyEntity {
    const persistenceEntity = new CurrencyEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.code = domainEntity.code;
    persistenceEntity.name = domainEntity.name;
    persistenceEntity.namePlural = domainEntity.namePlural;
    persistenceEntity.symbol = domainEntity.symbol;
    persistenceEntity.symbolNative = domainEntity.symbolNative;
    persistenceEntity.decimalDigits = domainEntity.decimalDigits;
    persistenceEntity.rounding = domainEntity.rounding;
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
