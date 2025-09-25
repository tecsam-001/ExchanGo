import { OfficeEntity } from 'src/offices/infrastructure/persistence/relational/entities/office.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'working_hour',
})
export class WorkingHourEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  dayOfWeek: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'time', nullable: true, default: '00:00' })
  fromTime: string;

  @Column({ type: 'time', nullable: true, default: '00:00' })
  toTime: string;

  @Column({ type: 'boolean', default: false })
  hasBreak: boolean;

  @Column({ type: 'time', nullable: true, default: '00:00' })
  breakFromTime: string;

  @Column({ type: 'time', nullable: true })
  breakToTime: string;

  // Relation to Office
  @Column({ nullable: true })
  officeId: string;

  @ManyToOne(() => OfficeEntity, (office) => office.workingHours, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'officeId' })
  office: OfficeEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
