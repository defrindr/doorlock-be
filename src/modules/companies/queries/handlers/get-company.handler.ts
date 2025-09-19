import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { CompanyDto } from '../../dto/company.dto';
import { Company } from '../../entities/company.entity';
import { GetCompanyQuery } from '../imp/get-company.query';

@QueryHandler(GetCompanyQuery)
export class GetCompanyHandler
  extends BaseHandler<GetCompanyQuery, ApiResponseDto<CompanyDto>>
  implements IQueryHandler<GetCompanyQuery, ApiResponseDto<CompanyDto>>
{
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {
    super();
  }

  async handle(query: GetCompanyQuery): Promise<ApiResponseDto<CompanyDto>> {
    const { id } = query;

    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundHttpException('Company not found');
    }

    const companyDto = plainToInstance(CompanyDto, company, {
      excludeExtraneousValues: true,
    });

    return OkResponse(companyDto, 'Company retrieved successfully');
  }
}
