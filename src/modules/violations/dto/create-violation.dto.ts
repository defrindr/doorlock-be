import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsNumber,
  IsUUID,
} from 'class-validator';

export class CreateViolationDto {
  @ApiProperty({
    description: 'Employee ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    description: 'Points to be deducted',
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  pointMinus: number;

  @ApiProperty({
    description: 'Date of violation',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  violationDate: string;

  @ApiProperty({
    description: 'Description of the violation',
    example: 'Late arrival to work',
  })
  @IsString()
  @IsNotEmpty()
  violationDescription: string;
}
