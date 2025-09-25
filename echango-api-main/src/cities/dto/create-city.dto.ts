import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { CountryDto } from 'src/countries/dto/country.dto';

export class CreateCityDto {
  @ApiProperty({ example: 'Rabat', type: String })
  @Transform(lowerCaseTransformer)
  name: string;

  @ApiProperty({ example: 'MA', type: CountryDto })
  country: CountryDto;
}
