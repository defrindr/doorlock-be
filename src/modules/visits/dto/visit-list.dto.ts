import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class VisitListDto {
  @ApiProperty({
    description: 'Visit Unique Identifier',
    example: '76DE423E-F36B-1410-88E6-00BD8D009321',
  })
  @Expose()
  id: string;

  @ApiPropertyOptional({
    description: 'Purpose of the visit',
    example: 'Project discussion with IT department',
  })
  @Expose()
  purpose?: string;

  @ApiPropertyOptional({
    description: 'Host employee ID (Account ID of the employee being visited)',
    example: '80DD423E-F36B-1410-88E6-00BD8D009321',
  })
  @Expose()
  hostEmployeeId?: string;

  @ApiPropertyOptional({
    description: 'Visit date',
    example: '2025-09-20T09:00:00Z',
  })
  @Expose()
  visitDate: Date;

  @ApiProperty({
    description: 'Valid until date/time of the visit',
    example: '2025-09-20T17:00:00Z',
  })
  @Expose()
  validUntil: Date;

  @ApiProperty({
    description: 'Date when the visit was created',
    example: '2025-09-19T15:04:00Z',
  })
  @Expose()
  createdAt: Date;

  // Additional Columns
  @ApiProperty({
    description: 'Visitor Company Name',
  })
  @Expose()
  companyName: string;

  @ApiProperty({
    description: 'Host Employee Name',
  })
  @Expose()
  hostEmployeeFullName: string;

  @ApiProperty({
    description: 'List of participants in the visit',
  })
  @Type(() => Number)
  @Expose()
  participantCount: number;

  constructor(partial: Partial<VisitListDto>) {
    Object.assign(this, partial);
  }
}
