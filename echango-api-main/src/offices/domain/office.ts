import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '../../files/domain/file';
import { User } from '../../users/domain/user';
import { Point } from 'geojson';
import { City } from '../../cities/domain/city';
import { Country } from '../../countries/domain/country';
import { OfficeRate } from '../../office-rates/domain/office-rate';
import { WorkingHour } from '../../working-hours/domain/working-hour';

export class Office {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: () => User,
  })
  owner: User;

  @ApiProperty()
  officeName: string;

  @ApiProperty({
    type: Object,
  })
  location: Point;

  @ApiProperty()
  registrationNumber: string;

  @ApiProperty()
  currencyExchangeLicenseNumber: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  city?: City | null;

  @ApiProperty()
  state?: string | null;

  @ApiProperty()
  country?: Country | null;

  @ApiProperty()
  primaryPhoneNumber: string;

  @ApiProperty()
  secondaryPhoneNumber?: string | null;

  @ApiProperty()
  thirdPhoneNumber?: string | null;

  @ApiProperty()
  whatsappNumber?: string | null;

  @ApiProperty()
  logo?: FileType | null;

  @ApiProperty()
  mainImage?: FileType | null;

  @ApiProperty()
  slug?: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt?: Date | null;

  @ApiProperty()
  distanceInKm?: number;

  @ApiProperty()
  rates?: OfficeRate[];

  @ApiProperty()
  equivalentValue?: number;

  @ApiProperty()
  images?: FileType[] | null;

  @ApiProperty()
  workingHours?: WorkingHour[];

  @ApiProperty()
  email?: string | null;

  @ApiProperty()
  todayWorkingHours?: WorkingHour;
}
