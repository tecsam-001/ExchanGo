import { IsArray, IsString } from 'class-validator';

export class QuickPatchDto {
  @IsString()
  field:
    | 'isActive'
    | 'fromTime'
    | 'toTime'
    | 'hasBreak'
    | 'breakFromTime'
    | 'breakToTime';

  @IsString()
  value: string | boolean;

  @IsArray()
  @IsString({ each: true })
  dayOfWeeks: string[];
}
