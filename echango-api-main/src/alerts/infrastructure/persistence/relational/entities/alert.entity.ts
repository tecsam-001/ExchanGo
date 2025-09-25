import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { OfficeEntity } from 'src/offices/infrastructure/persistence/relational/entities/office.entity';
import { CurrencyEntity } from 'src/currencies/infrastructure/persistence/relational/entities/currency.entity';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { CityEntity } from 'src/cities/infrastructure/persistence/relational/entities/city.entity';

export enum TriggerType {
  CITY = 'CITY',
  OFFICE = 'OFFICE',
}

@Entity({
  name: 'alert',
})
@Index(['createdAt'])
export class AlertEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: TriggerType,
    nullable: false,
    name: 'trigger_type',
  })
  triggerType: TriggerType;

  @Column({ type: 'varchar', nullable: true, name: 'whatsapp_number' })
  whatsAppNumber: string;

  //one alert for many cities
  @ManyToMany(() => CityEntity)
  @JoinTable({
    name: 'alert_city',
    joinColumn: {
      name: 'alert_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'city_id',
      referencedColumnName: 'id',
    },
  })
  cities: CityEntity[];

  //one alert for many offices
  @ManyToMany(() => OfficeEntity)
  @JoinTable({
    name: 'alert_office',
    joinColumn: {
      name: 'alert_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'office_id',
      referencedColumnName: 'id',
    },
  })
  offices: OfficeEntity[];

  @ManyToOne(() => CurrencyEntity, (currency) => currency.id)
  @JoinColumn({ name: 'currency_id' })
  currency: CurrencyEntity;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity | null;

  @Column({ type: 'decimal', nullable: false, name: 'base_currency_amount' })
  baseCurrencyAmount: number;

  @Column({ type: 'decimal', nullable: false, name: 'target_currency_amount' })
  targetCurrencyAmount: number;

  @ManyToOne(() => CurrencyEntity, (currency) => currency.id)
  @JoinColumn({ name: 'target_currency_id' })
  targetCurrency: CurrencyEntity;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
    name: 'is_active',
  })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
