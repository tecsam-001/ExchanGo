import { IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePhoneCallDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'Office ID', type: String })
  officeId: string;

  @ApiPropertyOptional({ example: 'Caller ID', type: String })
  callerId?: string | null;

  @ApiProperty({ example: 'Phone Number', type: String })
  phoneNumber: string;

  @ApiProperty({ example: 'Phone Type', type: String })
  phoneType: 'PRIMARY' | 'SECONDARY' | 'THIRD' | 'WHATSAPP';

  @ApiPropertyOptional({ example: 'IP Address', type: String })
  ipAddress?: string | null;
}
