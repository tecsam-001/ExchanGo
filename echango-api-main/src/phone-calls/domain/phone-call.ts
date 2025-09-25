import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Office } from '../../offices/domain/office';

export class PhoneCall {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  office: Office;

  @ApiProperty()
  caller?: User | null;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  phoneType: 'PRIMARY' | 'SECONDARY' | 'THIRD' | 'WHATSAPP';

  @ApiProperty()
  createdAt: Date;
}
