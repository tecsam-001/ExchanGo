import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { OfficeEntity } from '../../../../../offices/infrastructure/persistence/relational/entities/office.entity';
import { CurrencyEntity } from '../../../../../currencies/infrastructure/persistence/relational/entities/currency.entity';

@Entity({
  name: 'rate_history',
})
export class RateHistoryEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OfficeEntity, {
    eager: true,
  })
  office: OfficeEntity;

  @ManyToOne(() => CurrencyEntity, {
    eager: true,
  })
  targetCurrency: CurrencyEntity;

  @ManyToOne(() => CurrencyEntity, {
    eager: true,
  })
  baseCurrency: CurrencyEntity;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'old_buy_rate' })
  oldBuyRate: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'old_sell_rate' })
  oldSellRate: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'new_buy_rate' })
  newBuyRate: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, name: 'new_sell_rate' })
  newSellRate: number;

  @Column({ type: 'boolean', default: false, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
