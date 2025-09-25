import { Request } from '../../../../domain/request';
import { RequestEntity } from '../entities/request.entity';
import { OfficeEntity } from 'src/offices/infrastructure/persistence/relational/entities/office.entity';
import { OfficeMapper } from 'src/offices/infrastructure/persistence/relational/mappers/office.mapper';

export class RequestMapper {
  static toDomain(raw: RequestEntity): Request {
    const domainEntity = new Request();
    domainEntity.id = raw.id;
    if (raw.office) {
      domainEntity.office = OfficeMapper.toDomain(raw.office);
    }
    domainEntity.status = raw.status;
    domainEntity.rejectReason = raw.rejectReason;
    domainEntity.additionalMessage = raw.additionalMessage;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: Request): RequestEntity {
    let office: OfficeEntity | undefined = undefined;

    if (domainEntity.office) {
      office = new OfficeEntity();
      office.id = domainEntity.office.id;
    }
    const persistenceEntity = new RequestEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.office = office as OfficeEntity;
    persistenceEntity.status = domainEntity.status;
    if (domainEntity.rejectReason) {
      persistenceEntity.rejectReason = domainEntity.rejectReason;
    }
    if (domainEntity.additionalMessage) {
      persistenceEntity.additionalMessage = domainEntity.additionalMessage;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;

    return persistenceEntity;
  }
}
