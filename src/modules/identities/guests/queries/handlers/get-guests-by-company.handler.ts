import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { plainToInstance } from 'class-transformer';

import { AccountGuest } from '@src/modules/identities/entities/account-guest.entity';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { GuestDto } from '../../dto/guest.dto';
import { PageGuestDto } from '../../dto/page-guest.dto';
import { GetGuestsByCompanyQuery } from '../imp/get-guests-by-company.query';

@QueryHandler(GetGuestsByCompanyQuery)
export class GetGuestsByCompanyHandler
  extends BaseHandler<GetGuestsByCompanyQuery, PageGuestDto>
  implements IQueryHandler<GetGuestsByCompanyQuery, PageGuestDto>
{
  constructor(
    @InjectRepository(AccountGuest)
    private readonly guestRepository: Repository<AccountGuest>,
  ) {
    super();
  }

  async handle(query: GetGuestsByCompanyQuery): Promise<PageGuestDto> {
    const { pageOptionsDto, companyId } = query;

    let queryBuilder = this.guestRepository
      .createQueryBuilder('guest')
      .leftJoinAndSelect('guest.company', 'company')
      .leftJoinAndSelect('guest.account', 'account')
      .where({ companyId });

    queryBuilder = applyPaginationFilters(queryBuilder, {
      alias: 'guest',
      allowedSort: ['id', 'fullName', 'company.name', 'createdAt'],
      allowedSearch: ['fullName', 'company.name', 'identificationNumber'],
      allowedFilter: ['id', 'identificationType', 'account.status'],
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
