import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class BulkInsertEmployeeDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Excel file containing employee data to bulk insert',
    required: true,
  })
  @IsNotEmpty({ message: 'File is required' })
  file: any;
}
