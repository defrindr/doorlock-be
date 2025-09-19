import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { CreatedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { ConflictHttpException } from '@src/shared/core/exceptions/exception';
import { CompanyDto } from '../../dto/company.dto';
import { Company } from '../../entities/company.entity';
import { CreateCompanyCommand } from '../imp/create-company.command';

@CommandHandler(CreateCompanyCommand)
export class CreateCompanyHandler
  extends BaseHandler<CreateCompanyCommand, ApiResponseDto<CompanyDto>>
  implements ICommandHandler<CreateCompanyCommand, ApiResponseDto<CompanyDto>>
{
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {
    super();
  }

  async handle(
    command: CreateCompanyCommand,
  ): Promise<ApiResponseDto<CompanyDto>> {
    const { createCompanyDto } = command;

    // Check if company with same name already exists
    const existingCompany = await this.companyRepository.findOne({
      where: { name: createCompanyDto.name },
    });

    if (existingCompany) {
      throw new ConflictHttpException('Company with this name already exists');
    }

    const company = this.companyRepository.create(createCompanyDto);
    const savedCompany = await this.companyRepository.save(company);

    const companyDto = plainToInstance(CompanyDto, savedCompany, {
      excludeExtraneousValues: true,
    });

    return CreatedResponse(companyDto, 'Company created successfully');
  }
}
