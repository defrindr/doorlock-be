import { QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@src/modules/iam/entities/role.entity';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { GetRoleQuery } from '../imp/get-role.query';
import { RoleDto } from '../../dto/role.dto';

@QueryHandler(GetRoleQuery)
export class GetRoleHandler extends BaseHandler<
  GetRoleQuery,
  ApiResponseDto<RoleDto>
> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    super();
  }

  async handle(query: GetRoleQuery): Promise<ApiResponseDto<RoleDto>> {
    const { id } = query;

    const entity = await this.roleRepository.findOne({
      where: { id },
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
    });

    if (!entity) {
      throw new NotFoundHttpException('Data tidak ditemukan');
    }

    const rolePermissions = entity.rolePermissions || [];

    // remove rolePermissions and add permissions
    delete entity.rolePermissions;

    const transformEntities = {
      ...entity,
      permissions: rolePermissions.map((rp) => rp.permission),
    };

    const dto = plainToInstance(RoleDto, transformEntities, {
      excludeExtraneousValues: true,
    });

    return OkResponse<RoleDto>(dto, 'Data ditemukan');
  }
}
