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
  name: 'phone_call',
})
@Index(['office', 'createdAt'])
@Index(['createdAt'])
export class PhoneCallEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OfficeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'office_id' })
  office: OfficeEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'caller_id' })
  caller?: UserEntity | null;

  @Column({ type: 'varchar', length: 20, name: 'phone_number' })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: ['PRIMARY', 'SECONDARY', 'THIRD', 'WHATSAPP'],
    name: 'phone_type',
  })
  phoneType: 'PRIMARY' | 'SECONDARY' | 'THIRD' | 'WHATSAPP';

  @Column({ type: 'inet', nullable: true, name: 'ip_address' })
  ipAddress?: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
