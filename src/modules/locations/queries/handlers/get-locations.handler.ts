import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { LocationDto } from '../../dto/location.dto';
import { PageLocationDto } from '../../dto/page-location.dto';
import { Location } from '../../entities/location.entity';
import { GetLocationsQuery } from '../imp/get-locations.query';

@QueryHandler(GetLocationsQuery)
export class GetLocationsHandler
  extends BaseHandler<GetLocationsQuery, PageLocationDto>
  implements IQueryHandler<GetLocationsQuery>
{
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {
    super();
  }

  async handle(command: GetLocationsQuery): Promise<PageLocationDto> {
    const { pageOptionsDto } = command;

    let qb = this.locationRepository.createQueryBuilder('location');

    qb = applyPaginationFilters(qb, {
      alias: 'location',
      allowedSort: ['id', 'name', 'type', 'status', 'createdAt'],
      allowedSearch: ['name', 'type'],
      allowedFilter: ['id', 'type', 'status'],
      pageOptions: pageOptionsDto,
    });

    const [entities, itemCount] = await qb.getManyAndCount();

    const data = plainToInstance(LocationDto, entities, {
      excludeExtraneousValues: true,
    });

    const pageMeta = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageLocationDto(data, pageMeta);
  }
}
