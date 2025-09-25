import { IsBoolean, IsString, IsOptional, IsUUID } from 'class-validator';

export class PatchWorkingHourDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsString()
  dayOfWeek?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  fromTime?: string;

  @IsOptional()
  @IsString()
  toTime?: string;

  @IsOptional()
  @IsBoolean()
  hasBreak?: boolean;

  @IsOptional()
  @IsString()
  breakFromTime?: string;

  @IsOptional()
  @IsString()
  breakToTime?: string;
}
