import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PhoneCallDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
