import { ApiProperty } from '@nestjs/swagger';
import { PageMetaDto } from '@src/shared/paginations';
import { EmployeeDto } from './employee.dto';

export class PageEmployeeDto {
  @ApiProperty({ type: () => EmployeeDto, isArray: true })
  readonly data: EmployeeDto[];

  @ApiProperty({ type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(data: EmployeeDto[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
