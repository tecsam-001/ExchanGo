// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreatePhoneCallDto } from './create-phone-call.dto';

export class UpdatePhoneCallDto extends PartialType(CreatePhoneCallDto) {}
