import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { PageDto } from '@src/shared/paginations/dto/page.dto';
import { LocationDto } from './location.dto';

export class PageLocationDto extends PageDto<LocationDto> {
  @ApiProperty({
    type: LocationDto,
    isArray: true,
  })
  readonly data: LocationDto[];

  constructor(data: LocationDto[], meta: PageMetaDto) {
    super(data, meta);
  }
}
