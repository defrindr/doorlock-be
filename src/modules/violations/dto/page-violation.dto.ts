import { PageMetaDto } from '@src/shared/paginations';
import { ViolationDto } from './violation.dto';

export class PageViolationDto {
  readonly data: ViolationDto[];

  readonly meta: PageMetaDto;

  constructor(data: ViolationDto[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
