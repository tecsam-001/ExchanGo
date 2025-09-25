import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Point } from 'geojson';
import { UserDto } from 'src/users/dto/user.dto';
import { FileDto } from 'src/files/dto/file.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfficeDto {
  // Don't forget to use the class-validator decorators in the DTO properties.
  @ApiProperty({ example: 'Office Name', type: String })
  @IsString()
  @IsNotEmpty()
  officeName: string;

  @ApiProperty({ example: 'AAB-1234567890', type: String })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({ example: 'AAB-1234567890', type: String })
  @IsString()
  @IsNotEmpty()
  currencyExchangeLicenseNumber: string;

  @ApiProperty({ example: '123 Main St, Rabat, Morocco', type: String })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Rabat', type: String })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Rabat-Salé', type: String })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '+212 661 23 45 67', type: String })
  @IsString()
  @IsNotEmpty()
  primaryPhoneNumber: string;

  @ApiPropertyOptional({ example: '+212 661 23 45 67', type: String })
  @IsString()
  @IsOptional()
  secondaryPhoneNumber?: string | null;

  @ApiPropertyOptional({ example: '+212 661 23 45 67', type: String })
  @IsString()
  @IsOptional()
  thirdPhoneNumber?: string | null;

  @ApiPropertyOptional({ example: '+212 661 23 45 67', type: String })
  @IsString()
  @IsOptional()
  whatsappNumber?: string | null;

  @ApiPropertyOptional({ example: 'logo.png', type: FileDto })
  @IsOptional()
  logo?: FileDto | null;

  @ApiPropertyOptional({ example: 'main-image.jpg', type: FileDto })
  @IsOptional()
  mainImage?: FileDto | null;

  @ApiProperty({
    example: '{ type: "Point", coordinates: [longitude, latitude] }',
    type: Object,
  })
  @IsOptional()
  location: Point;

  @IsString()
  @IsOptional()
  owner?: UserDto | null;

  @IsString()
  @IsOptional()
  email?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
