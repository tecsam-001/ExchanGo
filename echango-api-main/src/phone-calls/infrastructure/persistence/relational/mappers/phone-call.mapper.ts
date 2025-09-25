import { PhoneCall } from '../../../../domain/phone-call';
import { PhoneCallEntity } from '../entities/phone-call.entity';
import { OfficeEntity } from 'src/offices/infrastructure/persistence/relational/entities/office.entity';
import { OfficeMapper } from 'src/offices/infrastructure/persistence/relational/mappers/office.mapper';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { UserMapper } from 'src/users/infrastructure/persistence/relational/mappers/user.mapper';

export class PhoneCallMapper {
  static toDomain(raw: PhoneCallEntity): PhoneCall {
    const domainEntity = new PhoneCall();
    domainEntity.id = raw.id;
    domainEntity.office = OfficeMapper.toDomain(raw.office);
    domainEntity.caller = raw.caller ? UserMapper.toDomain(raw.caller) : null;
    domainEntity.createdAt = raw.createdAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: PhoneCall): PhoneCallEntity {
    let office: OfficeEntity | undefined = undefined;

    if (domainEntity.office) {
      office = new OfficeEntity();
      office.id = domainEntity.office.id;
    }

    let caller: UserEntity | undefined | null = undefined;

    if (domainEntity.caller) {
      caller = new UserEntity();
      caller.id = Number(domainEntity.caller.id);
    }

    const persistenceEntity = new PhoneCallEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.phoneNumber = domainEntity.phoneNumber;
    persistenceEntity.phoneType = domainEntity.phoneType;
    persistenceEntity.office = office as OfficeEntity;
    persistenceEntity.caller = caller as UserEntity | null;
    persistenceEntity.createdAt = domainEntity.createdAt;

    return persistenceEntity;
  }
}
