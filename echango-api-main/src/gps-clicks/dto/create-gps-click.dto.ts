import { IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGpsClickDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'Office ID', type: String })
  officeId: string;

  @ApiPropertyOptional({ example: 'User ID', type: String })
  userId?: string | null;

  @ApiPropertyOptional({ example: 'IP Address', type: String })
  ipAddress?: string | null;
}
