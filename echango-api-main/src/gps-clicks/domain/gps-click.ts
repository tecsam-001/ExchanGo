import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Office } from '../../offices/domain/office';

export class GpsClick {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  office: Office;

  @ApiProperty()
  user?: User | null;

  @ApiProperty()
  ipAddress?: string | null;

  @ApiProperty()
  createdAt: Date;
}
