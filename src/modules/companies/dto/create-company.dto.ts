import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ description: 'Company name', example: 'Example Company' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Company address',
    example: '123 Main St, Anytown, USA',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Company status', example: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  status?: number = 1;
}
