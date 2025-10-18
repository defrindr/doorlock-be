import { ApiProperty } from '@nestjs/swagger';
import { VisitDto } from './visit.dto';

export class ImportVisitResultDto {
  @ApiProperty({
    description: 'Number of successfully imported visits',
    example: 1,
  })
  success: number;

  @ApiProperty({
    description: 'Number of failed imports',
    example: 0,
  })
  failed: number;

  @ApiProperty({
    description: 'List of errors encountered during import',
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
    description: 'List of successfully created visits',
    type: [VisitDto],
  })
  data: VisitDto[];
}
