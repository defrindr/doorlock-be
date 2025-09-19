import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';

import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { GetGuestQuery } from '../imp/get-guest.query';
import { GuestDto } from '../../dto/guest.dto';
import { AccountGuest } from '@src/modules/identities/entities/account-guest.entity';

@QueryHandler(GetGuestQuery)
export class GetGuestHandler
  extends BaseHandler<GetGuestQuery, ApiResponseDto<GuestDto>>
  implements IQueryHandler<GetGuestQuery, ApiResponseDto<GuestDto>>
{
  constructor(
    @InjectRepository(AccountGuest)
    private readonly guestRepository: Repository<AccountGuest>,
  ) {
    super();
  }

  async handle(query: GetGuestQuery): Promise<ApiResponseDto<GuestDto>> {
    const { id } = query;

    const guest = await this.guestRepository.findOne({
      where: { id },
      relations: ['company', 'account'],
    });

    if (!guest) {
      throw new NotFoundHttpException('Guest not found');
    }

    const guestDto = plainToInstance(GuestDto, guest, {
      excludeExtraneousValues: true,
    });

    return OkResponse(guestDto, 'Guest retrieved successfully');
  }
}
