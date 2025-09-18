import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { Gate } from '../../entities/gate.entity';
import { GateDto } from '../../dto/gate.dto';
import { GetGateQuery } from '../imp/get-gate.query';

@QueryHandler(GetGateQuery)
export class GetGateHandler
  extends BaseHandler<GetGateQuery, ApiResponseDto<GateDto>>
  implements IQueryHandler<GetGateQuery, ApiResponseDto<GateDto>>
{
  constructor(
    @InjectRepository(Gate)
    private readonly gateRepository: Repository<Gate>,
  ) {
    super();
  }

  async handle(query: GetGateQuery): Promise<ApiResponseDto<GateDto>> {
    const { id } = query;

    // Find gate by ID with location relation
    const gate = await this.gateRepository.findOne({
      where: { id },
      relations: ['location'],
    });

    if (!gate) {
      throw new NotFoundException(`Gate with ID ${id} not found`);
    }

    const gateDto = plainToInstance(GateDto, gate, {
      excludeExtraneousValues: true,
    });

    return OkResponse(gateDto, 'Gate retrieved successfully');
  }
}
