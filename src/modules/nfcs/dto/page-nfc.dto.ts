import { ApiProperty } from '@nestjs/swagger';
import { PageDto } from '@src/shared/paginations/dto/page.dto';
import { NfcDto } from './nfc.dto';

export class PageNfcDto extends PageDto<NfcDto> {
  @ApiProperty({
    type: NfcDto,
    isArray: true,
  })
  readonly data: NfcDto[];
}
