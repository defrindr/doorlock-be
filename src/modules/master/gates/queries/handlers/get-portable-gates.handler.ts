import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { PageRoleDto } from '@src/modules/iam/role/dto/page-role.dto';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { GateDto } from '../../dto/gate.dto';
import { GateType } from '../../entities/gate-type.enum';
import { Gate } from '../../entities/gate.entity';
import { GetPortableGatesQuery } from '../imp/get-portable-gates.query';

@QueryHandler(GetPortableGatesQuery)
export class GetPortableGatesHandler
  extends BaseHandler<GetPortableGatesQuery, PageRoleDto>
  implements IQueryHandler<GetPortableGatesQuery>
{
  constructor(
    @InjectRepository(Gate)
    private readonly gateRepository: Repository<Gate>,
  ) {
    super();
  }

  async handle(command: GetPortableGatesQuery): Promise<PageRoleDto> {
    const { pageOptionsDto } = command;

    let qb = this.gateRepository.createQueryBuilder('gate');

    // Join with location for search and display
    qb.leftJoinAndSelect('gate.location', 'location').where({
      type: GateType.PORTABLE,
    });

    qb = applyPaginationFilters(qb, {
      alias: 'gate',
      allowedSort: ['id', 'name', 'status', 'createdAt', 'locationId'],
      allowedSearch: ['name'],
      allowedFilter: ['id', 'status', 'locationId'],
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
