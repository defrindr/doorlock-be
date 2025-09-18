import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@src/modules/iam/entities/user.entity';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { PageUserDto } from '../../dto/page-user.dto';
import { UserDto } from '../../dto/user.dto';
import { GetUsersQuery } from '../imp/get-users.query';

@QueryHandler(GetUsersQuery)
export class GetUsersHandler extends BaseHandler<GetUsersQuery, any> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super();
  }

  async handle(query: GetUsersQuery): Promise<PageUserDto> {
    const { pageOptionsDto } = query;

    let qb = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role');

    qb = applyPaginationFilters(qb, {
      alias: 'user',
      allowedSort: ['id', 'username', 'name', 'status'],
      allowedSearch: ['username', 'name', 'email'],
      allowedFilter: ['id', 'username', 'status', 'roleId'],
      pageOptions: pageOptionsDto,
    });

    const [entities, itemCount] = await qb.getManyAndCount();

    const data = plainToInstance(UserDto, entities, {
      excludeExtraneousValues: true,
    });

    const pageMeta = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageUserDto(data, pageMeta);
  }
}
