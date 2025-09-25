import { ApiProperty } from '@nestjs/swagger';
import { Office } from 'src/offices/domain/office';
import { Country } from 'src/countries/domain/country';

export class City {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: Country,
  })
  country: Country | null;

  @ApiProperty({
    type: Office,
  })
  office?: Office | null;

  @ApiProperty({
    type: [Office],
    description: 'Array of offices in this city',
  })
  offices?: Office[];

  @ApiProperty({
    type: Number,
    description: 'Number of offices in this city',
  })
  numberOfOffices?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
