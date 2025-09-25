import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class WorkingHourDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
