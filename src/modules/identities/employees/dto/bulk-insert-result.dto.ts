import { ApiProperty } from '@nestjs/swagger';
import { EmployeeDto } from './employee.dto';

export class BulkInsertResultDto {
  @ApiProperty({
    description: 'Number of successfully inserted employees',
    example: 95,
  })
  success: number;

  @ApiProperty({
    description: 'Number of failed insertions',
    example: 5,
  })
  failed: number;

  @ApiProperty({
    description: 'List of errors encountered during bulk insert',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        row: { type: 'number', example: 3 },
        field: { type: 'string', example: 'email' },
        message: { type: 'string', example: 'Invalid email format' },
      },
    },
  })
  errors: Array<{
    row: number;
    field?: string;
    message: string;
  }>;

  @ApiProperty({
    description: 'List of successfully created employees',
    type: [EmployeeDto],
  })
  data: EmployeeDto[];
}
