import { ApiProperty } from '@nestjs/swagger';
import { Office } from 'src/offices/domain/office';
import { RequestStatus } from '../infrastructure/persistence/relational/entities/request.entity';

export class Request {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: Office,
  })
  office: Office;

  @ApiProperty({
    type: String,
  })
  status: RequestStatus;

  @ApiProperty({
    type: String,
  })
  rejectReason?: string;

  @ApiProperty({
    type: String,
  })
  additionalMessage?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
