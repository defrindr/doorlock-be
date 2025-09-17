import { ApiProperty } from '@nestjs/swagger';
import { PageDto, PageMetaDto } from '@src/shared/paginations';
import { Type } from 'class-transformer';
import { RoleDto } from './role.dto';

export class PageRoleDto extends PageDto<RoleDto> {
  @ApiProperty({ type: [RoleDto] })
  @Type(() => RoleDto)
  readonly data: RoleDto[];

  @ApiProperty({ type: PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(data: RoleDto[], meta: PageMetaDto) {
    super(data, meta);
  }
}
