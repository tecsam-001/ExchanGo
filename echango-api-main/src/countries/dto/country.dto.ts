import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CountryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unicode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  emoji: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  alpha2: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dialCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  capital: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  alpha3: string;
}
