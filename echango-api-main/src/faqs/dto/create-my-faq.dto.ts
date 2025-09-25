import { IsNotEmpty, IsString, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateMyFaqDto {
  @ApiProperty({
    description: 'The question for the FAQ',
    example: 'What are your exchange rates?',
  })
  @IsNotEmpty()
  @IsString()
  question: string;

  @ApiProperty({
    description: 'The answer for the FAQ',
    example:
      'Our exchange rates are updated daily and are competitive with market rates.',
  })
  @IsNotEmpty()
  @IsString()
  answer: string;
}

export class CreateMyFaqsDto {
  @ApiProperty({
    description: 'Array of FAQs to create',
    type: [CreateMyFaqDto],
    example: [
      {
        question: 'What are your exchange rates?',
        answer:
          'Our exchange rates are updated daily and are competitive with market rates.',
      },
      {
        question: 'What are your working hours?',
        answer: 'We are open Monday to Friday from 9 AM to 6 PM.',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMyFaqDto)
  faqs: CreateMyFaqDto[];
}
