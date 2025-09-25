// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateLandingPageDto } from './create-landing-page.dto';

export class UpdateLandingPageDto extends PartialType(CreateLandingPageDto) {}
