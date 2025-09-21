import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { HistoryDto } from '../../dto/history.dto';
import { History } from '../../entities/history.entity';
import { GetHistoryQuery } from '../imp/get-history.query';

@QueryHandler(GetHistoryQuery)
export class GetHistoryHandler
  extends BaseHandler<GetHistoryQuery, ApiResponseDto<HistoryDto>>
  implements IQueryHandler<GetHistoryQuery, ApiResponseDto<HistoryDto>>
{
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {
    super();
  }

  async handle(query: GetHistoryQuery): Promise<ApiResponseDto<HistoryDto>> {
    const { id } = query;

    const history = await this.historyRepository.findOne({
      where: { id },
    });

    if (!history) {
      throw new NotFoundHttpException('History not found');
    }

    const historyDto = plainToInstance(HistoryDto, history, {
      excludeExtraneousValues: true,
    });

    return OkResponse(historyDto, 'History retrieved successfully');
  }
}
