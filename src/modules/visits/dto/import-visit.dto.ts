import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ImportVisitDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Excel file containing visit data to import',
    required: true,
  })
  @IsNotEmpty({ message: 'File is required' })
  file: any;
}
