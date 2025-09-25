import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  Column,
  DeleteDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { OfficeEntity } from 'src/offices/infrastructure/persistence/relational/entities/office.entity';
import { CurrencyEntity } from 'src/currencies/infrastructure/persistence/relational/entities/currency.entity';

@Entity({
  name: 'office_rate',
})
export class OfficeRateEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OfficeEntity, {
    eager: true,
  })
  office: OfficeEntity;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'buy_rate' })
  buyRate: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'sell_rate' })
  sellRate: number;

  @ManyToOne(() => CurrencyEntity, {
    eager: true,
  })
  baseCurrency: CurrencyEntity;

  @ManyToOne(() => CurrencyEntity, {
    eager: true,
  })
  targetCurrency: CurrencyEntity;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;
}
