// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateRequestDto } from './create-request.dto';

export class UpdateRequestDto extends PartialType(CreateRequestDto) {}
