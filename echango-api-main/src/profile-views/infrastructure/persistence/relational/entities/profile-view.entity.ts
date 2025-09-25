import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { OfficeEntity } from 'src/offices/infrastructure/persistence/relational/entities/office.entity';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';

@Entity({
  name: 'profile_view',
})
@Index(['office', 'createdAt'])
@Index(['createdAt'])
export class ProfileViewEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OfficeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'office_id' })
  office: OfficeEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'viewer_id' })
  viewer?: UserEntity | null;

  @Column({ type: 'inet', nullable: true, name: 'ip_address' })
  ipAddress?: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'user_agent' })
  userAgent?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  referrer?: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
