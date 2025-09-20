import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountDto } from '@src/modules/identities/dto/account.dto';
import { GuestDto } from '@src/modules/identities/guests/dto/guest.dto';
import { CompanyDto } from '@src/modules/master/companies/dto/company.dto';
import { AccountEmployeeDto } from '@src/modules/visits/dto/employee.dto';
import { Expose, Type } from 'class-transformer';

export class VisitDto {
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
    description: 'Company Visitor ID',
    example: '80DD423E-F36B-1410-88E6-00BD8D009321',
  })
  @Expose()
  companyId?: string;

  @ApiPropertyOptional({
    description: 'Visit date',
    example: '2025-09-20T09:00:00Z',
  })
  @Type(() => Date)
  @Expose()
  visitDate: Date;

  @ApiProperty({
    description: 'Valid until date/time of the visit',
    example: '2025-09-20T17:00:00Z',
  })
  @Type(() => Date)
  @Expose()
  validUntil: Date;

  @ApiProperty({
    description: 'Date when the visit was created',
    example: '2025-09-19T15:04:00Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Host employee account information',
  })
  @Type(() => AccountEmployeeDto)
  @Expose()
  hostEmployee: AccountEmployeeDto;

  @ApiProperty({
    description: 'List of participants in the visit',
    type: () => [VisitParticipantDto],
  })
  @Type(() => VisitParticipantDto)
  @Expose()
  visitParticipants?: VisitParticipantDto[];

  @ApiProperty({
    description: 'List of participants in the visit',
    type: () => [GuestDto],
  })
  @Type(() => GuestDto)
  @Expose()
  participants?: GuestDto[];

  @ApiProperty({ description: 'Company information' })
  @Type(() => CompanyDto)
  @Expose()
  company: CompanyDto;
  constructor(partial: Partial<VisitDto>) {
    Object.assign(this, partial);
  }
}

export class VisitParticipantDto {
  @ApiProperty({
    description: 'Visit Participant Unique Identifier',
    example: 'A0DD423E-F36B-1410-88E6-00BD8D009321',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Visit ID related to the participant',
    example: '76DE423E-F36B-1410-88E6-00BD8D009321',
  })
  @Expose()
  visitId: string;

  @ApiProperty({
    description: 'Account ID of the participant',
    example: '80DD423E-F36B-1410-88E6-00BD8D009321',
  })
  @Expose()
  accountId: string;

  @ApiProperty({
    description: 'Date when participant record was created',
    example: '2025-09-19T15:04:00Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Account information of the participant',
    example: null,
    required: false,
  })
  @Type(() => AccountDto)
  @Expose()
  account?: AccountDto;

  constructor(partial: Partial<VisitParticipantDto>) {
    Object.assign(this, partial);
  }
}
