import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

enum DayOfWeek {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday',
}

export class CreateWorkingHourDto {
  @ApiProperty({
    description: 'Day of the week',
    enum: DayOfWeek,
    example: 'Monday',
  })
  @IsNotEmpty()
  @IsEnum(DayOfWeek, {
    message:
      'dayOfWeek must be one of: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday',
  })
  dayOfWeek: string;

  @ApiProperty({
    description: 'Indicates if the day is active for working hours',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Start time of working hours (HH:MM format)',
    example: '09:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'fromTime must be in HH:MM format (00:00-23:59)',
  })
  fromTime?: string;

  @ApiProperty({
    description: 'End time of working hours (HH:MM format)',
    example: '17:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'toTime must be in HH:MM format (00:00-23:59)',
  })
  toTime?: string;

  @ApiProperty({
    description: 'Indicates if there is a break during this day',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasBreak?: boolean;

  @ApiProperty({
    description: 'Start time of break (HH:MM format)',
    example: '12:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'breakFromTime must be in HH:MM format (00:00-23:59)',
  })
  breakFromTime?: string;

  @ApiProperty({
    description: 'End time of break (HH:MM format)',
    example: '13:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'breakToTime must be in HH:MM format (00:00-23:59)',
  })
  breakToTime?: string;

  @ApiProperty({
    description: 'ID of the associated office',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsNotEmpty()
  @IsUUID()
  officeId: string;
}
