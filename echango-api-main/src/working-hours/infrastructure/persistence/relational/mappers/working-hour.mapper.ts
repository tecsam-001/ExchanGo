import { WorkingHour } from '../../../../domain/working-hour';
import { WorkingHourEntity } from '../entities/working-hour.entity';

export class WorkingHourMapper {
  static toDomain(raw: WorkingHourEntity): WorkingHour {
    const domainEntity = new WorkingHour();
    domainEntity.id = raw.id;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.dayOfWeek = raw.dayOfWeek;
    domainEntity.isActive = raw.isActive;
    domainEntity.fromTime = raw.fromTime;
    domainEntity.toTime = raw.toTime;
    domainEntity.hasBreak = raw.hasBreak;
    domainEntity.breakFromTime = raw.breakFromTime;
    domainEntity.breakToTime = raw.breakToTime;
    domainEntity.officeId = raw.officeId;
    return domainEntity;
  }

  static toPersistence(domainEntity: WorkingHour): WorkingHourEntity {
    const persistenceEntity = new WorkingHourEntity();
    if (domainEntity.id) {
      persistenceEntity.id = domainEntity.id;
    }
    persistenceEntity.createdAt = domainEntity.createdAt;
    persistenceEntity.updatedAt = domainEntity.updatedAt;
    persistenceEntity.dayOfWeek = domainEntity.dayOfWeek;
    persistenceEntity.isActive = domainEntity.isActive;
    persistenceEntity.fromTime = domainEntity.fromTime;
    persistenceEntity.toTime = domainEntity.toTime;
    persistenceEntity.hasBreak = domainEntity.hasBreak;
    persistenceEntity.breakFromTime = domainEntity.breakFromTime;
    persistenceEntity.breakToTime = domainEntity.breakToTime;
    persistenceEntity.officeId = domainEntity.officeId;
    return persistenceEntity;
  }
}
