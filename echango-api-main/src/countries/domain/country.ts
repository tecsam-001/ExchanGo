import { ApiProperty } from '@nestjs/swagger';

export class Country {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: String,
  })
  unicode: string;

  @ApiProperty({
    type: String,
  })
  emoji: string;

  @ApiProperty({
    type: String,
  })
  alpha2: string;

  @ApiProperty({
    type: String,
  })
  dialCode: string;

  @ApiProperty({
    type: String,
  })
  region: string;

  @ApiProperty({
    type: String,
  })
  capital?: string | null;

  @ApiProperty({
    type: String,
  })
  alpha3: string;

  createdAt: Date;

  updatedAt: Date;
}
