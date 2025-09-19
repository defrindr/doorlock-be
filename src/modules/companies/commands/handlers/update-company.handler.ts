import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import {
  ConflictHttpException,
  NotFoundHttpException,
} from '@src/shared/core/exceptions/exception';
import { CompanyDto } from '../../dto/company.dto';
import { Company } from '../../entities/company.entity';
import { UpdateCompanyCommand } from '../imp/update-company.command';

@CommandHandler(UpdateCompanyCommand)
export class UpdateCompanyHandler
  extends BaseHandler<UpdateCompanyCommand, ApiResponseDto<CompanyDto>>
  implements ICommandHandler<UpdateCompanyCommand, ApiResponseDto<CompanyDto>>
{
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {
    super();
  }

  async handle(
    command: UpdateCompanyCommand,
  ): Promise<ApiResponseDto<CompanyDto>> {
    const { id, updateCompanyDto } = command;

    const [company, companyExist] = await Promise.all([
      this.companyRepository.findOne({ where: { id } }),
      this.companyRepository.findOne({
        where: { name: updateCompanyDto.name, id: Not(id) },
      }),
    ]);

    if (!company) {
      throw new NotFoundHttpException('Company not found');
    }
    if (companyExist) {
      throw new ConflictHttpException('Company with this name already exists');
    }

    await this.companyRepository.update(id, updateCompanyDto);

    const updatedCompany = await this.companyRepository.findOne({
      where: { id },
    });

    const companyDto = plainToInstance(CompanyDto, updatedCompany, {
      excludeExtraneousValues: true,
    });

    return OkResponse(companyDto, 'Company updated successfully');
  }
}
