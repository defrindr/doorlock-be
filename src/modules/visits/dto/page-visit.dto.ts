import { ApiProperty } from '@nestjs/swagger';
import { PageDto } from '@src/shared/paginations/dto/page.dto';
import { VisitListDto } from './visit-list.dto';

export class PageVisitDto extends PageDto<VisitListDto> {
  @ApiProperty({
    type: VisitListDto,
    isArray: true,
  })
  readonly data: VisitListDto[];
}
