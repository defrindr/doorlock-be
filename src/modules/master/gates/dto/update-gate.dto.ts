import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { GateType } from '../entities/gate-type.enum';

export class UpdateGateDto {
  @ApiProperty({
    description: 'Gate name',
    example: 'Main Gate A Updated',
    maxLength: 255,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  // @ApiProperty({
  //   description: 'Unique Identifier for gate',
  //   example: 'A1',
  //   maxLength: 50,
  // })
  // @IsString()
  // @IsNotEmpty()
  // @MaxLength(50)
  // gateIdentifier: string;

  @ApiProperty({
    description: 'Location ID where the gate is located',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  locationId?: string;

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
    required: false,
  })
  @IsOptional()
  @IsEnum(GateType)
  type?: GateType;
}
