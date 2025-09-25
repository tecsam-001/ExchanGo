import { IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProfileViewDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'Office ID', type: String })
  officeId: string;

  @ApiPropertyOptional({ example: 'Viewer ID', type: String })
  viewerId?: string | null;

  @ApiPropertyOptional({ example: 'IP Address', type: String })
  ipAddress?: string | null;

  @ApiPropertyOptional({ example: 'User Agent', type: String })
  userAgent?: string | null;

  @ApiPropertyOptional({ example: 'Referrer', type: String })
  referrer?: string | null;
}
