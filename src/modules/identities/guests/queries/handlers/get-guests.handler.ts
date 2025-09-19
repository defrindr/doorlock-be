import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { plainToInstance } from 'class-transformer';

import { PageGuestDto } from '../../dto/page-guest.dto';
import { GetGuestsQuery } from '../imp/get-guests.query';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { AccountGuest } from '@src/modules/identities/entities/account-guest.entity';
import { GuestDto } from '../../dto/guest.dto';

@QueryHandler(GetGuestsQuery)
export class GetGuestsHandler
  extends BaseHandler<GetGuestsQuery, PageGuestDto>
  implements IQueryHandler<GetGuestsQuery, PageGuestDto>
{
  constructor(
    @InjectRepository(AccountGuest)
    private readonly guestRepository: Repository<AccountGuest>,
  ) {
    super();
  }

  async handle(query: GetGuestsQuery): Promise<PageGuestDto> {
    const { pageOptionsDto } = query;

    let queryBuilder = this.guestRepository
      .createQueryBuilder('guest')
      .leftJoinAndSelect('guest.company', 'company')
      .leftJoinAndSelect('guest.account', 'account');

    queryBuilder = applyPaginationFilters(queryBuilder, {
      alias: 'guest',
      allowedSort: ['id', 'company.name', 'status', 'createdAt'],
      allowedSearch: ['company.name'],
      allowedFilter: ['id', 'status'],
      pageOptions: pageOptionsDto,
    });

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    const guestDtos = plainToInstance(GuestDto, entities, {
      excludeExtraneousValues: true,
    });

    return new PageGuestDto(guestDtos, pageMetaDto);
  }
}
