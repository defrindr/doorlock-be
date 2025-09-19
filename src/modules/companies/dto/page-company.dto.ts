import { ApiProperty } from '@nestjs/swagger';
import { PageDto } from '@src/shared/paginations/dto/page.dto';
import { CompanyDto } from './company.dto';

export class PageCompanyDto extends PageDto<CompanyDto> {
  @ApiProperty({
    type: CompanyDto,
    isArray: true,
  })
  readonly data: CompanyDto[];
}
