import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { PageMetaDto } from './page-meta.dto';

export class PageDto<T> {
  @ApiProperty({ type: [Object] })
  @Type(() => Object)
  readonly data: T[];

  @ApiProperty({ type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  @IsNumber()
  @ApiProperty({ type: 'number' })
  readonly code: number;

  constructor(data: T[], meta: PageMetaDto) {
    this.code = 200;
    this.data = data;
    this.meta = meta;
  }
}
