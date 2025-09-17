import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsNotEmpty,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Unique } from 'typeorm';

export class RegisterDto {
  @ApiProperty({
    description: 'Username',
    example: 'defrindr',
  })
  @IsAlphanumeric()
  @IsNotEmpty()
  @Unique('username', (value) => [
    {
      username: value,
    },
  ])
  public username: string;

  @ApiProperty({
    description: 'Password untuk login',
    example: 'defrindr',
  })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @MaxLength(16, { message: 'Password maksimal 16 karakter' })
  @IsNotEmpty()
  public password: string;

  @ApiProperty({
    description: 'Nama lengkap',
    example: 'Akun Demo',
  })
  @IsNotEmpty()
  public name: string;

  public roleId: string;
  public refreshToken: string;
}
