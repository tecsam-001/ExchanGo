import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PatchWorkingHourDto } from './patch-working-hour.dto';

export class BulkPatchWorkingHoursDto {
  @ApiProperty({ type: [PatchWorkingHourDto], required: true })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PatchWorkingHourDto)
  workingHours: PatchWorkingHourDto[];
}
