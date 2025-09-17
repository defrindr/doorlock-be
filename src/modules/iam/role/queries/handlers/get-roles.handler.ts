import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@src/modules/iam/entities/role.entity';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { PageMetaDto } from '@src/shared/paginations/dto';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { PageRoleDto } from '../../dto/page-role.dto';
import { RoleDto } from '../../dto/role.dto';
import { GetRolesQuery } from '../imp/get-roles.query';

@QueryHandler(GetRolesQuery)
export class GetRolesHandler extends BaseHandler<GetRolesQuery, PageRoleDto> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    super();
  }

  async handle(query: GetRolesQuery): Promise<PageRoleDto> {
    const { pageOptionsDto } = query;

    let queryBuilder = await this.roleRepository
      .createQueryBuilder('roles')
      .leftJoinAndSelect('roles.rolePermissions', 'rolePermissions')
      .leftJoinAndSelect('rolePermissions.permission', 'permission');

    queryBuilder = applyPaginationFilters(queryBuilder, {
      alias: 'roles',
      allowedSort: ['id', 'name'],
      allowedSearch: ['name', 'description'],
      allowedFilter: ['id', 'name'],
      pageOptions: pageOptionsDto,
    });

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const transformEntities = entities.map((entity) => {
      const obj = { ...entity };
      const rolePermissions = obj.rolePermissions || [];
      if (rolePermissions.length > 0) {
        rolePermissions.sort((a, b) =>
          a.permission.name.localeCompare(b.permission.name),
        );
      }

      // remove rolePermissions and add permissions
      delete obj.rolePermissions;

      return {
        ...obj,
        permissions: rolePermissions.map((rp) => rp.permission),
      };
    });

    // Transform to DTO
    const dto = plainToInstance(RoleDto, transformEntities, {
      excludeExtraneousValues: true,
    });

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageRoleDto(dto, pageMetaDto);
  }
}
