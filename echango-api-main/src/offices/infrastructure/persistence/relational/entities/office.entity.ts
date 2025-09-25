import {
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Column,
  JoinColumn,
  OneToOne,
  DeleteDateColumn,
  Index,
  BeforeUpdate,
  BeforeInsert,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { FileEntity } from '../../../../../files/infrastructure/persistence/relational/entities/file.entity';
import { Point } from 'geojson';
import slugify from 'slugify';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { CountryEntity } from 'src/countries/infrastructure/persistence/relational/entities/country.entity';
import { CityEntity } from 'src/cities/infrastructure/persistence/relational/entities/city.entity';
import { OfficeRateEntity } from 'src/office-rates/infrastructure/persistence/relational/entities/office-rate.entity';
import { WorkingHourEntity } from 'src/working-hours/infrastructure/persistence/relational/entities/working-hour.entity';
import { FaqEntity } from '../../../../../faqs/infrastructure/persistence/relational/entities/faq.entity';

@Entity({
  name: 'office',
})
export class OfficeEntity extends EntityRelationalHelper {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, {
    eager: true,
  })
  owner: UserEntity;

  @Column({ type: 'varchar', length: 255, name: 'office_name' })
  officeName: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, name: 'registration_number' })
  registrationNumber: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'currency_exchange_license_number',
  })
  currencyExchangeLicenseNumber: string;

  @Column({ type: 'varchar', length: 255 })
  address: string;

  @ManyToOne(() => CityEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'city_id' })
  city?: CityEntity | null;

  @ManyToOne(() => CountryEntity, {
    eager: true,
  })
  @JoinColumn({ name: 'country_id' })
  country?: CountryEntity | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  state?: string | null;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    nullable: true,
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location: Point;

  @Column({ type: 'varchar', length: 255, name: 'primary_phone_number' })
  primaryPhoneNumber: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'secondary_phone_number',
  })
  secondaryPhoneNumber?: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'third_phone_number',
  })
  thirdPhoneNumber?: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'whatsapp_number',
  })
  whatsappNumber?: string | null;

  @OneToOne(() => FileEntity, {
    eager: true,
  })
  @JoinColumn()
  logo?: FileEntity | null;

  @OneToOne(() => FileEntity, {
    eager: true,
  })
  @JoinColumn()
  mainImage?: FileEntity | null;

  @ManyToMany(() => FileEntity, { cascade: true, eager: true })
  @JoinTable({
    name: 'offices_images',
    joinColumn: { name: 'office_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'file_id', referencedColumnName: 'id' },
  })
  images: FileEntity[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string | null;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, nullable: true })
  slug?: string | null;

  @Index()
  @Column({ type: 'boolean', default: false, name: 'is_active' })
  isActive: boolean;

  @Index()
  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  isVerified: boolean;

  @Index()
  @Column({ type: 'boolean', default: false, name: 'is_featured' })
  isFeatured: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date | null;

  @OneToMany(() => OfficeRateEntity, (rate) => rate.office)
  rates: OfficeRateEntity[];

  @OneToMany(() => WorkingHourEntity, (workingHour) => workingHour.office)
  workingHours: WorkingHourEntity[];

  @OneToMany(() => FaqEntity, (faq) => faq.office)
  faqs: FaqEntity[];

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    if (this.officeName && (!this.slug || this.slug.trim() === '')) {
      this.slug = slugify(this.officeName, {
        lower: true,
        strict: true,
        trim: true,
      });
    }
  }
}
