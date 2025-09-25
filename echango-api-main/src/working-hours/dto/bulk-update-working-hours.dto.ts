import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateWorkingHourDto } from './update-working-hour.dto';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateWorkingHoursDto {
  @ApiProperty({ type: [UpdateWorkingHourDto], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateWorkingHourDto)
  workingHours: UpdateWorkingHourDto[];
}
