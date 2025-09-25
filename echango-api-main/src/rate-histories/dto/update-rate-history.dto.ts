// Don't forget to use the class-validator decorators in the DTO properties.
// import { Allow } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { CreateRateHistoryDto } from './create-rate-history.dto';

export class UpdateRateHistoryDto extends PartialType(CreateRateHistoryDto) {}
