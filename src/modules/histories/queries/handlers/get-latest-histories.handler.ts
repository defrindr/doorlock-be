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
import { GetLatestHistoriesQuery } from '../imp/get-latest-histories.query';

@QueryHandler(GetLatestHistoriesQuery)
export class GetLatestHistoriesHandler
  extends BaseHandler<GetLatestHistoriesQuery, PageHistoryDto>
  implements IQueryHandler<GetLatestHistoriesQuery, PageHistoryDto>
{
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {
    super();
  }

  async handle(): Promise<PageHistoryDto> {
    let queryBuilder = this.historyRepository.createQueryBuilder('history');

    queryBuilder = applyPaginationFilters(queryBuilder, {
      alias: 'history',
      allowedSort: ['timestamp', 'id', 'status'],
      allowedSearch: ['companyName', 'accountName', 'gateName'],
      allowedFilter: ['id', 'status'],
      pageOptions: {
        take: 50,
        skip: 0,
      },
    });

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: {
        page: 1,
        take: 50,
        skip: 0,
      },
    });

    const historyDtos = plainToInstance(HistoryDto, entities, {
      excludeExtraneousValues: true,
    });

    return new PageHistoryDto(historyDtos, pageMetaDto);
  }
}
