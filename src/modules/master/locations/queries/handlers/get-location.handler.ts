import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { LocationDto } from '../../dto/location.dto';
import { Location } from '../../entities/location.entity';
import { GetLocationQuery } from '../imp/get-location.query';

@QueryHandler(GetLocationQuery)
export class GetLocationHandler
  extends BaseHandler<GetLocationQuery, ApiResponseDto<LocationDto>>
  implements IQueryHandler<GetLocationQuery>
{
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {
    super();
  }

  async handle(
    command: GetLocationQuery,
  ): Promise<ApiResponseDto<LocationDto>> {
    const { id } = command;

    const location = await this.locationRepository.findOne({ where: { id } });

    if (!location) {
      throw new NotFoundHttpException(`Location with ID '${id}' not found`);
    }

    const locationDto = plainToInstance(LocationDto, location, {
      excludeExtraneousValues: true,
    });
    return OkResponse(locationDto, 'Location retrieved successfully');
  }
}
