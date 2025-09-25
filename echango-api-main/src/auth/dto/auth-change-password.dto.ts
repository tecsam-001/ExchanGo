import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, Validate } from 'class-validator';
import { IsEqualTo } from '../../utils/validators/is-equal-to.validator';

export class AuthChangePasswordDto {
  @ApiProperty({
    example: 'currentPassword123',
    description: 'Current password of the user',
  })
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  oldPassword: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'New password for the user',
  })
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  @MinLength(6, { message: 'passwordTooShort' })
  newPassword: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'Confirmation of the new password',
  })
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  @Validate(IsEqualTo, ['newPassword'], { message: 'passwordsDoNotMatch' })
  confirmPassword: string;
}
