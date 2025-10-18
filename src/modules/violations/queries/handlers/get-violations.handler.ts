import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { ViolationDto } from '../../dto/violation.dto';
import { PageViolationDto } from '../../dto/page-violation.dto';
import { Violation } from '../../entities/violation.entity';
import { GetViolationsQuery } from '../imp/get-violations.query';

@QueryHandler(GetViolationsQuery)
export class GetViolationsHandler
  extends BaseHandler<GetViolationsQuery, PageViolationDto>
  implements IQueryHandler<GetViolationsQuery, PageViolationDto>
{
  constructor(
    @InjectRepository(Violation)
    private readonly violationRepository: Repository<Violation>,
  ) {
    super();
  }

  async handle(query: GetViolationsQuery): Promise<PageViolationDto> {
    const { pageOptionsDto } = query;

    let queryBuilder = this.violationRepository.createQueryBuilder('violation');

    queryBuilder = applyPaginationFilters(queryBuilder, {
      alias: 'violation',
      allowedSort: ['violationDate', 'createdAt', 'id'],
      allowedSearch: ['violationDescription'],
      allowedFilter: ['id', 'employeeId'],
      pageOptions: pageOptionsDto,
    });

    // Order by created date descending by default
    queryBuilder.orderBy('violation.createdAt', 'DESC');

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    const violationDtos = plainToInstance(ViolationDto, entities, {
      excludeExtraneousValues: true,
    });

    return new PageViolationDto(violationDtos, pageMetaDto);
  }
}
