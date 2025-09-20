import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateVisitDto {
  @ApiPropertyOptional({
    description: 'Company ID (The company being visited)',
    example: 'ADDF423E-F36B-1410-88E6-00BD8D009321',
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
    example: '97DF423E-F36B-1410-88E6-00BD8D009321',
  })
  @IsUUID()
  @IsOptional()
  hostEmployeeId?: string;

  @ApiPropertyOptional({
    description: 'Visit date (defaults to current date if not provided)',
    example: '2025-09-20',
  })
  @IsDateString()
  @IsOptional()
  visitDate?: Date;

  @ApiPropertyOptional({
    description: 'Valid until date/time of the visit',
    example: '2025-09-27',
  })
  @IsDateString()
  @IsNotEmpty()
  validUntil: Date;

  @ApiPropertyOptional({
    description: 'List of visit participant Account IDs',
    example: [
      'B3DF423E-F36B-1410-88E6-00BD8D009321',
      'B5DF423E-F36B-1410-88E6-00BD8D009321',
    ],
  })
  @IsUUID('all', { each: true })
  @IsNotEmpty({ each: true })
  visitParticipants: string[];
}
