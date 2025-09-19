import { ApiProperty } from '@nestjs/swagger';
import { PageDto } from '@src/shared/paginations/dto/page.dto';
import { GuestDto } from './guest.dto';

export class PageGuestDto extends PageDto<GuestDto> {
  @ApiProperty({
    type: GuestDto,
    isArray: true,
  })
  readonly data: GuestDto[];
}
