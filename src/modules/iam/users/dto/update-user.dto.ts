import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Username',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  public username?: string;

  @ApiPropertyOptional({
    description: 'Password for login',
    example: 'password123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  @MaxLength(50, { message: 'Password maksimal 50 karakter' })
  @Type(() => String)
  public password?: string;

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  public name?: string;

  @ApiProperty({
    description: 'Phone number',
    example: '081234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  public phone?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  @Type(() => String)
  public email?: string;

  @ApiProperty({
    description: 'Role ID',
    example: 'xxx-xxx-xxx-xxx',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  public roleId?: string;

  @ApiProperty({
    description: 'Photo URL',
    example: 'https://example.com/photo.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  public photoUrl?: string;

  @ApiProperty({
    description: 'User status',
    example: 'active',
    enum: ['active', 'inactive'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  @Type(() => String)
  public status?: 'active' | 'inactive';
}
