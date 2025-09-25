import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Point } from 'geojson';
import { UserDto } from 'src/users/dto/user.dto';
import { FileDto } from 'src/files/dto/file.dto';

export class OfficeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  officeName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  primaryPhoneNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  secondaryPhoneNumber?: string | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  thirdPhoneNumber?: string | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  whatsappNumber?: string | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  logo?: FileDto | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  slug?: string | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  location?: Point | null;

  @ApiProperty()
  owner: UserDto;

  @ApiProperty()
  @IsString()
  @IsOptional()
  createdAt?: Date | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  updatedAt?: Date | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  deletedAt?: Date | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  isActive?: boolean | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  isVerified?: boolean | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  isFeatured?: boolean | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  isDeleted?: boolean | null;

  @ApiProperty()
  @IsString()
  @IsOptional()
  images?: FileDto[] | null;
}
