import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { plainToInstance } from 'class-transformer';

import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { HistoryDto } from '../../dto/history.dto';
import { PageHistoryDto } from '../../dto/page-history.dto';
import { History } from '../../entities/history.entity';
import { GetHistoriesQuery } from '../imp/get-histories.query';

@QueryHandler(GetHistoriesQuery)
export class GetHistoriesHandler
  extends BaseHandler<GetHistoriesQuery, PageHistoryDto>
  implements IQueryHandler<GetHistoriesQuery, PageHistoryDto>
{
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {
    super();
  }

  async handle(query: GetHistoriesQuery): Promise<PageHistoryDto> {
    const { pageOptionsDto } = query;
    const { timestamp, ...pageOptionsDtoFinal } = pageOptionsDto;

    let queryBuilder = this.historyRepository.createQueryBuilder('history');

    console.log('timestamp', timestamp);
    if (timestamp) {
      queryBuilder.andWhere('history.timestamp BETWEEN :start AND :end', {
        start: timestamp.start,
        end: timestamp.end,
      });
    }

    queryBuilder = applyPaginationFilters(queryBuilder, {
      alias: 'history',
      allowedSort: ['timestamp', 'id', 'status'],
      allowedSearch: ['companyName', 'accountName', 'gateName'],
      allowedFilter: ['id', 'status'],
      pageOptions: {
        skip:
          ((pageOptionsDtoFinal.page ?? 1) - 1) *
          (pageOptionsDtoFinal.take ?? 20),
        ...pageOptionsDtoFinal,
      },
    });

    // get raw query
    console.log(queryBuilder.getSql());

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    const historyDtos = plainToInstance(HistoryDto, entities, {
      excludeExtraneousValues: true,
    });

    return new PageHistoryDto(historyDtos, pageMetaDto);
  }
}
