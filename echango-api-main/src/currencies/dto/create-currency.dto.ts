import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrencyDto {
  // Don't forget to use the class-validator decorators in the DTO properties.
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
}
