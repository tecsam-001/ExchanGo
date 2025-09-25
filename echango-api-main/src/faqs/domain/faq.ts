import { ApiProperty } from '@nestjs/swagger';
import { Office } from 'src/offices/domain/office';

export class Faq {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  question: string;

  @ApiProperty()
  answer: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  office: Office;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
