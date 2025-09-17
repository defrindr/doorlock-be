import { ApiPropertyOptional } from '@nestjs/swagger';

export class SortDto {
  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  readonly id?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  readonly name?: 'ASC' | 'DESC';
}
