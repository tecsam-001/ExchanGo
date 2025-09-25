import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  @IsNotEmpty()
  officeId: string;
}
