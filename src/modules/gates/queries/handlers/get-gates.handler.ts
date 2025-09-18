import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { PageRoleDto } from '@src/modules/iam/role/dto/page-role.dto';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { GateDto } from '../../dto/gate.dto';
import { Gate } from '../../entities/gate.entity';
import { GetGatesQuery } from '../imp/get-gates.query';

@QueryHandler(GetGatesQuery)
export class GetGatesHandler
  extends BaseHandler<GetGatesQuery, PageRoleDto>
  implements IQueryHandler<GetGatesQuery>
{
  constructor(
    @InjectRepository(Gate)
    private readonly gateRepository: Repository<Gate>,
  ) {
    super();
  }

  async handle(command: GetGatesQuery): Promise<PageRoleDto> {
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

    return new PageRoleDto(gatesDto, pageMetaDto);
  }
}
