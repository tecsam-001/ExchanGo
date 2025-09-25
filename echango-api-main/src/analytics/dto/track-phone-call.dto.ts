import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class TrackPhoneCallDto {
  @ApiProperty({ example: 'Phone Number', type: String })
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: 'Phone Type', type: String })
  @IsNotEmpty()
  phoneType: 'PRIMARY' | 'SECONDARY' | 'THIRD' | 'WHATSAPP';
}
