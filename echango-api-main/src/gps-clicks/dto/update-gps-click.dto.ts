// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateGpsClickDto } from './create-gps-click.dto';

export class UpdateGpsClickDto extends PartialType(CreateGpsClickDto) {}
