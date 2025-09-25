// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateOfficeDto } from './create-office.dto';

export class UpdateOfficeDto extends PartialType(CreateOfficeDto) {}
