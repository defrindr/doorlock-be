import { ApiProperty } from '@nestjs/swagger';
import { PageDto } from '@src/shared/paginations/dto/page.dto';
import { HistoryDto } from './history.dto';

export class PageHistoryDto extends PageDto<HistoryDto> {
  @ApiProperty({
    type: HistoryDto,
    isArray: true,
  })
  readonly data: HistoryDto[];
}
