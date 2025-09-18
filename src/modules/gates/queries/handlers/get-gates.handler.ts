import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { Gate } from '../../entities/gate.entity';
import { GateDto } from '../../dto/gate.dto';
import { PageGateDto } from '../../dto/page-gate.dto';
import { GetGatesQuery } from '../imp/get-gates.query';

@QueryHandler(GetGatesQuery)
export class GetGatesHandler
  extends BaseHandler<GetGatesQuery, ApiResponseDto<PageGateDto>>
  implements IQueryHandler<GetGatesQuery>
{
  constructor(
    @InjectRepository(Gate)
    private readonly gateRepository: Repository<Gate>,
  ) {
    super();
  }

  async handle(command: GetGatesQuery): Promise<ApiResponseDto<PageGateDto>> {
    const { pageOptionsDto } = command;

    let qb = this.gateRepository.createQueryBuilder('gate');

    // Join with location for search and display
    qb.leftJoinAndSelect('gate.location', 'location');

    qb = applyPaginationFilters(qb, {
      alias: 'gate',
      allowedSort: ['id', 'name', 'type', 'status', 'createdAt', 'locationId'],
      allowedSearch: ['name', 'type'],
      allowedFilter: ['id', 'type', 'status', 'locationId'],
      pageOptions: pageOptionsDto,
    });

    const [gates, total] = await qb.getManyAndCount();

    const gatesDto = plainToInstance(GateDto, gates, {
      excludeExtraneousValues: true,
    });

    const pageMetaDto = new PageMetaDto({
      itemCount: total,
      pageOptionsDto,
    });

    const pageDto = new PageGateDto();
    pageDto.data = gatesDto;
    pageDto.meta = pageMetaDto;

    return OkResponse(pageDto, 'Gates retrieved successfully');
  }
}
