import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AccountDto } from './account.dto';

export class AccountEmployeeDto {
  @ApiProperty({
    description: 'Employee Unique Identifier',
    example: '76DE423E-F36B-1410-88E6-00BD8D009321',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Associated Account ID',
    example: '80DD423E-F36B-1410-88E6-00BD8D009321',
  })
  @Expose()
  accountId: string;

  @ApiProperty({
    description: 'Employee Number',
    example: 'EMP-00123',
  })
  @Expose()
  employeeNumber: string;

  @ApiProperty({ description: 'Full Name of Employee', example: 'John Doe' })
  @Expose()
  fullName: string;

  @ApiProperty({
    description: 'Department Name',
    example: 'IT',
    nullable: true,
  })
  @Expose()
  department?: string;

  @ApiProperty({
    description: 'Position Title',
    example: 'Software Engineer',
    nullable: true,
  })
  @Expose()
  position?: string;

  @ApiProperty({
    description: 'Email Address',
    example: 'john.doe@company.com',
    nullable: true,
  })
  @Expose()
  email?: string;

  @ApiProperty({ description: 'Violation Points', example: 2 })
  @Expose()
  violationPoints: number;

  @ApiProperty({
    description: 'Phone Number',
    example: '628123456789',
    nullable: true,
  })
  @Expose()
  phone?: string;

  @ApiProperty({
    description: 'Hire Date',
    example: '2025-01-15',
    nullable: true,
  })
  @Expose()
  hireDate?: Date;

  @ApiProperty({
    description: 'Supervisor Employee ID',
    example: '76DE423E-F36B-1410-88E6-00BD8D009999',
    nullable: true,
  })
  @Expose()
  supervisorId?: string;

  @ApiProperty({
    description: 'Created At Timestamp',
    example: '2025-01-01T08:30:00Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Updated At Timestamp',
    example: '2025-01-20T10:45:00Z',
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    description: 'Deleted At Timestamp',
    example: null,
    nullable: true,
  })
  @Expose()
  deletedAt?: Date;

  // Relations
  @ApiProperty({
    description: 'Account information related to this employee',
    type: () => AccountDto,
  })
  @Type(() => AccountDto)
  @Expose()
  account?: AccountDto;

  @ApiProperty({
    description: 'Supervisor information',
    type: () => AccountEmployeeDto,
    nullable: true,
  })
  @Type(() => AccountEmployeeDto)
  @Expose()
  supervisor?: AccountEmployeeDto;

  @ApiProperty({
    description: 'List of subordinates under this employee',
    type: () => [AccountEmployeeDto],
    nullable: true,
  })
  @Type(() => AccountEmployeeDto)
  @Expose()
  subordinates?: AccountEmployeeDto[];

  constructor(partial: Partial<AccountEmployeeDto>) {
    Object.assign(this, partial);
  }
}
