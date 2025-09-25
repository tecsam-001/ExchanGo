import {
  IsOptional,
  IsBoolean,
  IsString,
  Matches,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWorkingHourDto {
  @IsString()
  dayOfWeek: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:MM format',
  })
  fromTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:MM format',
  })
  toTime?: string;

  @IsOptional()
  @IsBoolean()
  hasBreak?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Break time must be in HH:MM format',
  })
  breakFromTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Break time must be in HH:MM format',
  })
  breakToTime?: string;
}

export class UpdateWorkingHoursDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateWorkingHourDto)
  workingHours: UpdateWorkingHourDto[];
}
