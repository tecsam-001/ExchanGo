import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RejectRequestDto {
  @ApiProperty({ example: 'Reject Reason', type: String })
  @IsString()
  @IsNotEmpty()
  rejectReason: string;

  @ApiPropertyOptional({ example: 'Additional Message', type: String })
  @IsString()
  @IsOptional()
  additionalMessage?: string;
}
