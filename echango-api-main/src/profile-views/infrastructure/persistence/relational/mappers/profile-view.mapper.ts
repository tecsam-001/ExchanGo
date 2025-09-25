import { ProfileView } from '../../../../domain/profile-view';
import { ProfileViewEntity } from '../entities/profile-view.entity';
import { OfficeEntity } from 'src/offices/infrastructure/persistence/relational/entities/office.entity';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { OfficeMapper } from 'src/offices/infrastructure/persistence/relational/mappers/office.mapper';
import { UserMapper } from 'src/users/infrastructure/persistence/relational/mappers/user.mapper';

export class ProfileViewMapper {
  static toDomain(raw: ProfileViewEntity): ProfileView {
    const domainEntity = new ProfileView();
    domainEntity.id = raw.id;
    domainEntity.office = OfficeMapper.toDomain(raw.office);
    domainEntity.viewer = raw.viewer ? UserMapper.toDomain(raw.viewer) : null;
    domainEntity.ipAddress = raw.ipAddress;
    domainEntity.userAgent = raw.userAgent;
    domainEntity.referrer = raw.referrer;
    domainEntity.createdAt = raw.createdAt;

    return domainEntity;
  }

  static toPersistence(domainEntity: ProfileView): ProfileViewEntity {
    let office: OfficeEntity | undefined = undefined;

    if (domainEntity.office) {
      office = new OfficeEntity();
      office.id = domainEntity.office.id;
    }

    let viewer: UserEntity | undefined | null = undefined;

    if (domainEntity.viewer) {
      viewer = new UserEntity();
      viewer.id = Number(domainEntity.viewer.id);
    }

    const persistenceEntity = new ProfileViewEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.office = office as OfficeEntity;
    persistenceEntity.viewer = viewer as UserEntity | null;
    persistenceEntity.ipAddress = domainEntity.ipAddress;
    persistenceEntity.userAgent = domainEntity.userAgent;
    persistenceEntity.referrer = domainEntity.referrer;
    return persistenceEntity;
  }
}
