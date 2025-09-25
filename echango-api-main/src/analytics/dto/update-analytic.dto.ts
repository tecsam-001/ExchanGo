// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateAnalyticDto } from './create-analytic.dto';

export class UpdateAnalyticDto extends PartialType(CreateAnalyticDto) {}
