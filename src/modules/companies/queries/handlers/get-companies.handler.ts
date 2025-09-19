import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { plainToInstance } from 'class-transformer';

import { CompanyDto } from '../../dto/company.dto';
import { PageCompanyDto } from '../../dto/page-company.dto';
import { Company } from '../../entities/company.entity';
import { GetCompaniesQuery } from '../imp/get-companies.query';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';

@QueryHandler(GetCompaniesQuery)
export class GetCompaniesHandler
  extends BaseHandler<GetCompaniesQuery, PageCompanyDto>
  implements IQueryHandler<GetCompaniesQuery, PageCompanyDto>
{
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {
    super();
  }

  async handle(query: GetCompaniesQuery): Promise<PageCompanyDto> {
    const { pageOptionsDto } = query;

    let queryBuilder = this.companyRepository.createQueryBuilder('company');

    queryBuilder = applyPaginationFilters(queryBuilder, {
      alias: 'company',
      allowedSort: ['id', 'name', 'status', 'createdAt'],
      allowedSearch: ['name'],
      allowedFilter: ['id', 'status'],
      pageOptions: pageOptionsDto,
    });

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    const companyDtos = plainToInstance(CompanyDto, entities, {
      excludeExtraneousValues: true,
    });

    return new PageCompanyDto(companyDtos, pageMetaDto);
  }
}
