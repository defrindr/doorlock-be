import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Employee number (unique identifier)',
    example: 'EMP001',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  employeeNumber: string;

  @ApiProperty({
    description: 'Employee full name',
    example: 'John Smith',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({
    description: 'Department where the employee works',
    example: 'Information Technology',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @ApiPropertyOptional({
    description: 'Employee job position/title',
    example: 'Senior Software Engineer',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  position?: string;

  @ApiPropertyOptional({
    description: 'Employee email address',
    example: 'john.smith@company.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Employee phone number',
    example: '+628123456789',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Employee hire date',
    example: '2020-01-15',
  })
  @IsDateString()
  @IsOptional()
  hireDate?: Date;

  @ApiPropertyOptional({
    description: 'Violation points (default: 10)',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  violationPoints?: number;

  @ApiPropertyOptional({
    description: 'Supervisor employee ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  supervisorId?: string;

  @ApiPropertyOptional({
    description: 'Location ID where employee is assigned',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  locationId?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Employee photo (image upload)',
  })
  photo?: any;

  @ApiPropertyOptional({
    description: 'Account status (0: inactive, 1: active)',
    enum: [0, 1],
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  status?: number;

  @ApiPropertyOptional({
    description: 'NFC code for door access',
    example: 'EMP001234',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  nfcCode?: string;
}
