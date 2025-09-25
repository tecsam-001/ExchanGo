import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'currency',
})
export class CurrencyEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    unique: true,
  })
  code: string;

  @Column({
    type: 'varchar',
  })
  name: string;

  @Column({
    type: 'varchar',
    name: 'name_plural',
  })
  namePlural: string;

  @Column({
    type: 'varchar',
  })
  symbol: string;

  @Column({
    type: 'varchar',
    name: 'symbol_native',
  })
  symbolNative: string;

  @Column({
    type: 'smallint',
    name: 'decimal_digits',
  })
  decimalDigits: number;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  rounding: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
