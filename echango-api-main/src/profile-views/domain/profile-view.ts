import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Office } from '../../offices/domain/office';
export class ProfileView {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  office: Office;

  @ApiProperty()
  viewer?: User | null;

  @ApiProperty()
  ipAddress?: string | null;

  @ApiProperty()
  userAgent?: string | null;

  @ApiProperty()
  referrer?: string | null;

  @ApiProperty()
  createdAt: Date;
}
