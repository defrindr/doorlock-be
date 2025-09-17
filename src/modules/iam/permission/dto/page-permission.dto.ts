import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ResponsePermissionDto } from './response-permission.dto';
import { PageDto, PageMetaDto } from '@src/shared/paginations';

export class PagePermissionDto extends PageDto<ResponsePermissionDto> {
  @ApiProperty({ type: [ResponsePermissionDto] })
  @Type(() => ResponsePermissionDto)
  readonly data: ResponsePermissionDto[];

  @ApiProperty({ type: PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(data: ResponsePermissionDto[], meta: PageMetaDto) {
    super(data, meta);
  }
}
