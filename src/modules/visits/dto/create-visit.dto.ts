import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateVisitDto {
  @ApiPropertyOptional({
    description: 'Company ID (The company being visited)',
    example: 'B9E1C8E0-5D57-4F35-A299-8B7C4325DA4D',
  })
  @IsUUID()
  @IsOptional()
  companyId?: string;

  @ApiPropertyOptional({
    description: 'Purpose of the visit',
    example: 'Project discussion with IT department',
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  purpose?: string;

  @ApiPropertyOptional({
    description: 'Host employee ID (Account ID of the employee being visited)',
    example: 'B9E1C8E0-5D57-4F35-A299-8B7C4325DA4D',
  })
  @IsUUID()
  @IsOptional()
  hostEmployeeId?: string;

  @ApiPropertyOptional({
    description: 'Visit date (defaults to current date if not provided)',
    example: '2025-09-20T09:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  visitDate?: Date;

  @ApiPropertyOptional({
    description: 'Valid until date/time of the visit',
    example: '2025-09-27T09:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  validUntil: Date;

  @ApiProperty({
    description: 'List of visit participant Account IDs',
    example: [
      'A1E2C3D4-5678-90AB-CDEF-1234567890AB',
      'B1E2C3D4-5678-90AB-CDEF-1234567890AB',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  visitParticipants?: string[];
}
