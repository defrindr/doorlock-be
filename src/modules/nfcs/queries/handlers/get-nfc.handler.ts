import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { PrepareDataService } from '../../services/prepare-data.service';
import { GetNfcQuery } from '../imp/get-nfc.query';
import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';

@QueryHandler(GetNfcQuery)
export class GetNfcHandler
  extends BaseHandler<GetNfcQuery, ApiResponseDto<any>>
  implements IQueryHandler<GetNfcQuery, ApiResponseDto<any>>
{
  constructor(private readonly service: PrepareDataService) {
    super();
  }

  async handle(query: GetNfcQuery): Promise<ApiResponseDto<any>> {
    const { visitId, type, guestId } = query;
    if (!visitId || !type || !guestId)
      throw new BadRequestHttpException("Parameter doesn't match");
    const response = await this.service.prepare({ visitId, type, guestId });
    return OkResponse(response, 'Nfc retrieved successfully');
  }
}
