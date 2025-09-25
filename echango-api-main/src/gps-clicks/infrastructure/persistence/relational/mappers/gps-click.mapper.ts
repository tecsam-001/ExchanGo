import { GpsClick } from '../../../../domain/gps-click';
import { GpsClickEntity } from '../entities/gps-click.entity';
import { OfficeEntity } from 'src/offices/infrastructure/persistence/relational/entities/office.entity';
import { OfficeMapper } from 'src/offices/infrastructure/persistence/relational/mappers/office.mapper';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { UserMapper } from 'src/users/infrastructure/persistence/relational/mappers/user.mapper';

export class GpsClickMapper {
  static toDomain(raw: GpsClickEntity): GpsClick {
    const domainEntity = new GpsClick();
    domainEntity.id = raw.id;
    domainEntity.office = OfficeMapper.toDomain(raw.office);
    domainEntity.user = raw.user ? UserMapper.toDomain(raw.user) : null;
    domainEntity.ipAddress = raw.ipAddress;
    domainEntity.createdAt = raw.createdAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: GpsClick): GpsClickEntity {
    let office: OfficeEntity | undefined = undefined;

    if (domainEntity.office) {
      office = new OfficeEntity();
      office.id = domainEntity.office.id;
    }

    let user: UserEntity | undefined | null = undefined;

    if (domainEntity.user) {
      user = new UserEntity();
      user.id = Number(domainEntity.user.id);
    }

    const persistenceEntity = new GpsClickEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.office = office as OfficeEntity;
    persistenceEntity.user = user as UserEntity | null;
    persistenceEntity.ipAddress = domainEntity.ipAddress;
    persistenceEntity.createdAt = domainEntity.createdAt;

    return persistenceEntity;
  }
}
