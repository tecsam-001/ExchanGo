import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsArray,
  // Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TriggerType } from '../infrastructure/persistence/relational/entities/alert.entity';

export class CreateAlertDto {
  // Don't forget to use the class-validator decorators in the DTO properties.
  @ApiProperty({
    example: 'CITY',
    enum: TriggerType,
    description: 'Type of trigger for the alert. Must be either CITY or OFFICE',
  })
  @IsEnum(TriggerType)
  @IsNotEmpty()
  triggerType: TriggerType;

  @ApiProperty({
    example: '+923482129578',
    type: String,
    description:
      'WhatsApp number in international format (e.g., +923482129578)',
  })
  @IsString()
  @IsNotEmpty()
  // @Matches(/^\+[1-9]\d{1,14}$/, {
  //   message:
  //     'WhatsApp number must be in international format (e.g., +923482129578)',
  // })
  whatsAppNumber: string;

  @ApiProperty({
    example: ['685e6c55-95cb-46a9-877c-05bf28afeaff'],
    type: [String],
    description:
      'Array of city UUIDs for city-based alerts (required when triggerType is CITY)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  cities?: string[] | null;

  @ApiProperty({
    example: [
      '48bc5c92-8cea-4dcf-8b47-3a6c9f33e6ce',
      '12345678-1234-1234-1234-123456789012',
    ],
    type: [String],
    description:
      'Array of office UUIDs for office-based alerts (required when triggerType is OFFICE)',
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  offices?: string[] | null;

  @ApiProperty({ example: 'Currency', type: String })
  @IsOptional()
  currency: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    type: String,
    description: 'User UUID (optional, for authenticated users)',
  })
  @IsOptional()
  @IsUUID(4)
  user?: string | null;

  @ApiProperty({ example: 'Base Currency Amount', type: Number })
  @IsNumber()
  @IsNotEmpty()
  baseCurrencyAmount: number;

  @ApiProperty({ example: 'Target Currency Amount', type: Number })
  @IsNumber()
  @IsNotEmpty()
  targetCurrencyAmount: number;

  @ApiProperty({ example: 'Target Currency', type: String })
  @IsOptional()
  targetCurrency: string;
}
