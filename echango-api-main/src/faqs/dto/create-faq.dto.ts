import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFaqDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  answer: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  officeId: string;
}
