import { Faq } from '../../../../domain/faq';
import { FaqEntity } from '../entities/faq.entity';
import { OfficeMapper } from '../../../../../offices/infrastructure/persistence/relational/mappers/office.mapper';

export class FaqMapper {
  static toDomain(raw: FaqEntity): Faq {
    const domainEntity = new Faq();
    domainEntity.id = raw.id;
    domainEntity.question = raw.question;
    domainEntity.answer = raw.answer;
    domainEntity.isActive = raw.isActive;
    if (raw.office) {
      domainEntity.office = OfficeMapper.toDomain(raw.office);
    }
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Faq): FaqEntity {
    const persistenceEntity = new FaqEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.question = domainEntity.question;
    persistenceEntity.answer = domainEntity.answer;
    persistenceEntity.isActive = domainEntity.isActive;
    if (domainEntity.office) {
      persistenceEntity.office = OfficeMapper.toPersistence(
        domainEntity.office,
      );
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
