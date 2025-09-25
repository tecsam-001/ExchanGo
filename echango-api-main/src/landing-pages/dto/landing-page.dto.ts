import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LandingPageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;
}
