import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  Column,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { OfficeEntity } from 'src/offices/infrastructure/persistence/relational/entities/office.entity';

export enum RequestStatus {
  REQUESTED = 'REQUESTED',
  ON_HOLD = 'ON_HOLD',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Entity({
  name: 'request',
})
export class RequestEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OfficeEntity, {
    eager: true,
  })
  office: OfficeEntity;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.REQUESTED,
  })
  status: RequestStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rejectReason: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  additionalMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
