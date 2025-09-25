import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  OneToMany,
  Index,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { CityEntity } from 'src/cities/infrastructure/persistence/relational/entities/city.entity';

@Entity({
  name: 'country',
})
export class CountryEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  unicode: string;

  @Column({ type: 'varchar', length: 255 })
  emoji: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  alpha2: string;

  @Column({ type: 'varchar', length: 255, name: 'dial_code' })
  dialCode: string;

  @Column({ type: 'varchar', length: 255 })
  alpha3: string;

  @Column({ type: 'varchar', length: 255 })
  region: string;

  @Column({ type: 'varchar', length: 255 })
  capital?: string | null;

  @OneToMany(() => CityEntity, (city) => city.country)
  cities?: CityEntity[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
