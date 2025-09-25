import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOfficeRateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'USD', type: String })
  targetCurrency: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 10, type: Number })
  buyRate: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 10, type: Number })
  sellRate: number;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ example: true, type: Boolean })
  isActive: boolean;

  @IsString()
  @IsOptional()
  owner?: string;

  @IsString()
  @IsOptional()
  officeId?: string;
}
