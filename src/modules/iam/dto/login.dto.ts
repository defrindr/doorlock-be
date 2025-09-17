import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'The username used to login',
    required: true,
  })
  @IsNotEmpty({ message: 'Username tidak boleh kosong' })
  username: string;

  @ApiProperty({
    example: 'password',
    description: 'The password used to login',
    required: true,
  })
  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @IsString({ message: 'Password harus berupa string' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @MaxLength(20, { message: 'Password maksimal 20 karakter' })
  password: string;

  @ApiProperty({
    example: '',
    description: 'The fcm token used to login',
    required: false,
  })
  @IsString()
  @IsOptional()
  fcmToken: string;
}
