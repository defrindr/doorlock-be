import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Unique } from 'typeorm';

export class CreateUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'admin@example.com',
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
    example: 'password',
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

  @ApiProperty({
    required: false,
    description: 'Nomor telepon',
    example: '081234567890',
  })
  @IsNumberString()
  public phone?: string;

  @ApiProperty({
    required: false,
    description: 'Alamat email',
    example: 'loremipsum@mail.com',
  })
  @IsEmail()
  public email?: string;

  @ApiProperty({
    required: false,
    description: 'Token Firebase Cloud Messaging',
    example: '1234567890',
  })
  @IsString()
  public fcmToken?: string;

  @ApiProperty({
    required: true,
    description: 'ID Role',
    example: 'xxx-xxx-xxx-xxx',
  })
  @IsString()
  public roleId?: string;

  @ApiProperty({
    required: false,
    description: 'URL foto',
    example: 'https://example.com/foto.jpg',
  })
  @IsString()
  @IsOptional()
  public photoUrl?: string;
}
