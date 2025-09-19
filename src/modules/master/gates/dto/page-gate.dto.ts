import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { GateDto } from './gate.dto';

export class PageGateDto {
  @ApiProperty({
    description: 'Array of gates',
    type: [GateDto],
  })
  data: GateDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PageMetaDto,
  })
  meta: PageMetaDto;
}
