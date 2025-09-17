import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '@src/modules/iam/entities/permission.entity';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { applyPaginationFilters } from '@src/shared/utils/paginations/apply-pagination-filter';
import { PageMetaDto } from '@src/shared/utils/paginations/dto';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { PagePermissionDto } from '../../dto/page-permission.dto';
import { ResponsePermissionDto } from '../../dto/response-permission.dto';
import { GetPermissionsQuery } from '../get-permissions.query';

@QueryHandler(GetPermissionsQuery)
export class GetPermissionsHandler extends BaseHandler<
  GetPermissionsQuery,
  any
> {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super();
  }

  async handle(query: GetPermissionsQuery): Promise<PagePermissionDto> {
    const { pageOptionsDto } = query;

    let qb = this.permissionRepository.createQueryBuilder('permission');

    qb = applyPaginationFilters(qb, {
      alias: 'permission',
      allowedSort: ['id', 'name'],
      allowedSearch: ['name', 'description'],
      allowedFilter: ['id', 'name'],
      pageOptions: pageOptionsDto,
    });

    const [entities, itemCount] = await qb.getManyAndCount();

    const data = plainToInstance(ResponsePermissionDto, entities, {
      excludeExtraneousValues: true,
    });

    const pageMeta = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PagePermissionDto(data, pageMeta);
  }
}
