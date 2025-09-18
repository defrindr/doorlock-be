import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { LocationType } from '../entities/location-type.enum';

export class CreateLocationDto {
  @ApiProperty({
    description: 'Location name',
    example: 'Main Warehouse Jakarta',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Location type',
    enum: LocationType,
    example: LocationType.WAREHOUSE,
  })
  @IsEnum(LocationType)
  @IsNotEmpty()
  type: LocationType;

  @ApiProperty({
    description: 'Location status (0=inactive, 1=active)',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  status?: number = 1;
}
