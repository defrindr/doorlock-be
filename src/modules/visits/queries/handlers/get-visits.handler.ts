import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { plainToInstance } from 'class-transformer';

import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { PageVisitDto } from '../../dto/page-visit.dto';
import { VisitListDto } from '../../dto/visit-list.dto';
import { Visit } from '../../entities/visit.entity';
import { GetVisitsQuery } from '../imp/get-visits.query';

@QueryHandler(GetVisitsQuery)
export class GetVisitsHandler
  extends BaseHandler<GetVisitsQuery, PageVisitDto>
  implements IQueryHandler<GetVisitsQuery, PageVisitDto>
{
  constructor(
    @InjectRepository(Visit)
    private readonly visitRepository: Repository<Visit>,
  ) {
    super();
  }

  async handle(query: GetVisitsQuery): Promise<PageVisitDto> {
    const { pageOptionsDto } = query;

    let queryBuilder = this.visitRepository
      .createQueryBuilder('visit')
      .leftJoin('visit.company', 'company')
      .leftJoin('visit.hostEmployee', 'hostEmployee')
      .addSelect('company.name', 'companyName')
      .addSelect('hostEmployee.fullName', 'hostEmployeeFullName')
      .loadRelationCountAndMap(
        'visit.participantCount',
        'visit.visitParticipants',
      );

    queryBuilder = applyPaginationFilters(queryBuilder, {
      alias: 'visit',
      allowedSort: ['id', 'purpose', 'createdAt'],
      allowedSearch: ['purpose', 'company.name', 'hostEmployee.fullName'],
      allowedFilter: ['id', 'company.id', 'hostEmployee.id'],
      pageOptions: pageOptionsDto,
    });

    const [entities, itemCount] = await Promise.all([
      queryBuilder.getRawAndEntities(),
      queryBuilder.getCount(),
    ]);
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    const visitDtos = entities.entities.map((visit, i) => ({
      ...visit,
      companyName: entities.raw[i].companyName,
      hostEmployeeFullName: entities.raw[i].hostEmployeeFullName,
    }));

    return new PageVisitDto(
      plainToInstance(VisitListDto, visitDtos, {
        excludeExtraneousValues: true,
      }),
      pageMetaDto,
    );
  }
}
