import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Entity({
  name: 'notification_preference',
})
export class NotificationPreferenceEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    type: 'boolean',
    default: true,
    name: 'rate_update_reminder_whatsapp',
  })
  rateUpdateReminderWhatsApp: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'rate_update_reminder_email',
  })
  rateUpdateReminderEmail: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
