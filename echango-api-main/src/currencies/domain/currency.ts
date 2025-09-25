import { ApiProperty } from '@nestjs/swagger';

export class Currency {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  namePlural: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  symbolNative: string;

  @ApiProperty()
  decimalDigits: number;

  @ApiProperty()
  rounding: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  flag?: string;
}
