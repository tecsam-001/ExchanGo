// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateCurrencyDto } from './create-currency.dto';

export class UpdateCurrencyDto extends PartialType(CreateCurrencyDto) {}
