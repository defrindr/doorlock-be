import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';

import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';
import { PrepareDataService } from '../../services/prepare-data.service';
import { GetNfcQuery } from '../imp/get-nfc.query';

@QueryHandler(GetNfcQuery)
export class GetNfcHandler
  extends BaseHandler<GetNfcQuery, ApiResponseDto<any>>
  implements IQueryHandler<GetNfcQuery, ApiResponseDto<any>>
{
  constructor(private readonly service: PrepareDataService) {
    super();
  }

  async handle(query: GetNfcQuery): Promise<ApiResponseDto<any>> {
    const { type, data } = query;
    if (!type) {
      throw new BadRequestHttpException("Parameter doesn't match");
    }
    let response: any = [];
    if (type === 'visitor') {
      if (!data.visitId || !data.guestId)
        throw new BadRequestHttpException("Parameter doesn't match");
      response = await this.service.prepare({
        visitId: data.visitId,
        type,
        guestId: data.guestId,
      });
    } else if (type === 'employee') {
      if (!data.employeeId)
        throw new BadRequestHttpException("Parameter doesn't match");
      response = await this.service.prepare({
        employeeId: data.employeeId,
        type,
      });
    }
    return OkResponse(response, 'Nfc retrieved successfully');
  }
}
