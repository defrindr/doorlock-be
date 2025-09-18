import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { PageDto } from '@src/shared/paginations/dto/page.dto';
import { UserDto } from './user.dto';

export class PageUserDto extends PageDto<UserDto> {
  @ApiProperty({
    type: UserDto,
    isArray: true,
  })
  readonly data: UserDto[];

  constructor(data: UserDto[], meta: PageMetaDto) {
    super(data, meta);
  }
}
