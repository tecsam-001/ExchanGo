import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CurrencyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  namePlural: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  symbolNative: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  decimalDigits: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  rounding: number;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;
}
