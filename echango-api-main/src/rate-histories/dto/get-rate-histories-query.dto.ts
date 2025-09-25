import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum TimePeriod {
  LAST_SEVEN_DAYS = 'LAST_SEVEN_DAYS',
  LAST_ONE_MONTH = 'LAST_ONE_MONTH',
  LAST_SIX_MONTHS = 'LAST_SIX_MONTHS',
  LAST_ONE_YEAR = 'LAST_ONE_YEAR',
  ALL_HISTORY = 'ALL_HISTORY',
}

export class GetRateHistoriesQueryDto {
  @ApiPropertyOptional({
    enum: TimePeriod,
    description: 'Time period filter for rate histories',
    example: TimePeriod.LAST_SEVEN_DAYS,
    default: TimePeriod.ALL_HISTORY,
  })
  @IsOptional()
  @IsEnum(TimePeriod)
  timePeriod?: TimePeriod = TimePeriod.ALL_HISTORY;
}
