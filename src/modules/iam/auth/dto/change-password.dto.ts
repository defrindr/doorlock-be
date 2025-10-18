import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'currentPassword123',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: 'New password for the user account (minimum 8 characters)',
    example: 'newPassword123',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;

  @ApiProperty({
    description: 'Confirmation of the new password (must match newPassword)',
    example: 'newPassword123',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
