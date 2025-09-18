import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { GateType } from '../entities/gate-type.enum';

export class CreateGateDto {
  @ApiProperty({
    description: 'Gate name',
    example: 'Main Gate A',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Location ID where the gate is located',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  locationId: string;

  @ApiProperty({
    description: 'Gate status (0: inactive, 1: active)',
    example: 1,
    minimum: 0,
    maximum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  status?: number;

  @ApiProperty({
    description: 'Gate type',
    enum: GateType,
    example: GateType.PHYSICAL,
  })
  @IsEnum(GateType)
  @IsNotEmpty()
  type: GateType;
}
