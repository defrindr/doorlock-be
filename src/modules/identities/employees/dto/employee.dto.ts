import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompanyDto } from '@src/modules/master/companies/dto/company.dto';
import { LocationDto } from '@src/modules/master/locations/dto/location.dto';
import { Exclude, Expose, Type } from 'class-transformer';
import { AccountDto } from '../../dto/account.dto';
import { GateDto } from '@src/modules/visits/dto/gate.dto';

@Exclude()
export class EmployeeDto {
  @Expose()
  @ApiProperty({
    description: 'Employee unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Account ID reference',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  accountId: string;

  @Expose()
  @ApiProperty({
    description: 'Employee number',
    example: 'EMP001',
  })
  employeeNumber: string;

  @Expose()
  @ApiProperty({
    description: 'Employee full name',
    example: 'John Smith',
  })
  fullName: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Department',
    example: 'Information Technology',
  })
  department?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Job position',
    example: 'Senior Software Engineer',
  })
  position?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Email address',
    example: 'john.smith@company.com',
  })
  email?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+628123456789',
  })
  phone?: string;

  @Expose()
  @ApiProperty({
    description: 'Violation points',
    example: 10,
  })
  violationPoints: number;

  @Expose()
  @ApiPropertyOptional({
    description: 'Hire date',
    example: '2020-01-15',
  })
  hireDate?: Date;

  @Expose()
  @ApiPropertyOptional({
    description: 'Supervisor employee ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  supervisorId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  locationId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Location details',
  })
  @Type(() => LocationDto)
  location?: LocationDto;

  @Expose()
  @ApiPropertyOptional({
    description: 'Location ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  companyId?: string;

  @Expose()
  @ApiPropertyOptional({
    description: 'Location details',
  })
  @Type(() => CompanyDto)
  company?: CompanyDto;

  @Expose()
  @ApiProperty({
    description: 'Account status',
    example: 1,
  })
  status: number;

  @Expose()
  @ApiPropertyOptional({
    description: 'NFC code',
    example: 'EMP001234',
  })
  nfcCode?: string;

  @ApiProperty({
    description: 'Guest Card Account information',
  })
  @Type(() => AccountDto)
  @Type(() => AccountDto)
  @Expose()
  account?: AccountDto;

  @Expose()
  @ApiProperty({
    description: 'Created at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional({
    description: 'Deleted at timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  deletedAt?: Date;

  @ApiProperty({
    description: 'List of gates',
    type: () => [GateDto],
  })
  @Type(() => GateDto)
  @Expose()
  accesses?: GateDto[];
}
