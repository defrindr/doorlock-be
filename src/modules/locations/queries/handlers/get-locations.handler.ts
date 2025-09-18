import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { Location } from '../../entities/location.entity';
import { LocationDto } from '../../dto/location.dto';
import { PageLocationDto } from '../../dto/page-location.dto';
import { GetLocationsQuery } from '../imp/get-locations.query';

@QueryHandler(GetLocationsQuery)
export class GetLocationsHandler
  extends BaseHandler<GetLocationsQuery, ApiResponseDto<PageLocationDto>>
  implements IQueryHandler<GetLocationsQuery>
{
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {
    super();
  }

  async handle(
    command: GetLocationsQuery,
  ): Promise<ApiResponseDto<PageLocationDto>> {
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
    const pageLocationDto = new PageLocationDto(data, pageMeta);

    return OkResponse(pageLocationDto, 'Locations retrieved successfully');
  }
}
