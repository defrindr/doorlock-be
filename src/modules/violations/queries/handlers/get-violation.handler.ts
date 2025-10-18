import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ViolationDto } from '../../dto/violation.dto';
import { Violation } from '../../entities/violation.entity';
import { GetViolationQuery } from '../imp/get-violation.query';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

@QueryHandler(GetViolationQuery)
export class GetViolationHandler
  extends BaseHandler<GetViolationQuery, ApiResponseDto<ViolationDto>>
  implements IQueryHandler<GetViolationQuery, ApiResponseDto<ViolationDto>>
{
  constructor(
    @InjectRepository(Violation)
    private readonly violationRepository: Repository<Violation>,
  ) {
    super();
  }

  async handle(
    query: GetViolationQuery,
  ): Promise<ApiResponseDto<ViolationDto>> {
    const { id } = query;

    const violation = await this.violationRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!violation) {
      throw new Error('Violation not found');
    }

    const dto = plainToInstance(ViolationDto, violation, {
      excludeExtraneousValues: true,
    });

    return OkResponse(dto, 'Violation successfully received');
  }
}
