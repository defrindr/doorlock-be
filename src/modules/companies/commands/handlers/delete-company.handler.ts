import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { Company } from '../../entities/company.entity';
import { DeleteCompanyCommand } from '../imp/delete-company.command';

@CommandHandler(DeleteCompanyCommand)
export class DeleteCompanyHandler
  extends BaseHandler<DeleteCompanyCommand, ApiResponseDto<string>>
  implements ICommandHandler<DeleteCompanyCommand, ApiResponseDto<string>>
{
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {
    super();
  }

  async handle(command: DeleteCompanyCommand): Promise<ApiResponseDto<string>> {
    const { id } = command;

    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundHttpException('Company not found');
    }

    await this.companyRepository.softDelete(id);

    return OkResponse(
      'Company deleted successfully',
      'Company deleted successfully',
    );
  }
}
