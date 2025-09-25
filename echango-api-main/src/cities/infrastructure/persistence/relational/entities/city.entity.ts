import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { OfficeEntity } from 'src/offices/infrastructure/persistence/relational/entities/office.entity';
import { CountryEntity } from 'src/countries/infrastructure/persistence/relational/entities/country.entity';
@Entity({
  name: 'city',
})
export class CityEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => OfficeEntity, (office) => office.id)
  @JoinColumn({ name: 'office_id' })
  office?: OfficeEntity | null;

  @ManyToOne(() => CountryEntity, (country) => country.id)
  @JoinColumn({ name: 'country_id' })
  country?: CountryEntity | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
