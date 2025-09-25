import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AnalyticDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
