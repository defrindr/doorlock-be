import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { RolePermission } from '@src/modules/iam/entities/role-permission.entity';
import { Role } from '@src/modules/iam/entities/role.entity';
import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { CreatedResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { RoleDto } from '../../dto/role.dto';
import { CreateRoleCommand } from '../imp/create-role.command';
import { Permission } from '@src/modules/iam/entities/permission.entity';

@CommandHandler(CreateRoleCommand)
export class CreateRoleHandler extends BaseHandler<
  CreateRoleCommand,
  ApiResponseDto<RoleDto>
> {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Role)
    protected readonly roleRepository: Repository<Role>,
  ) {
    super();
  }

  async handle(command: CreateRoleCommand): Promise<ApiResponseDto<RoleDto>> {
    const { payload } = command;

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // Extract permission
      let roleExist: Role | null;
      let permissionExists: Permission[];
      try {
        const permissions = payload.permissionIds;
        [roleExist, permissionExists] = await Promise.all([
          manager.findOne(Role, { where: { name: payload.name } }),
          permissions
            ? manager.find(Permission, {
                where: { id: In(permissions) },
              })
            : [],
        ]);
      } catch (error) {
        throw new BadRequestHttpException(error.message);
      }

      // Validasi role sudah ada
      if (roleExist) {
        throw new BadRequestHttpException('Role name already exists');
      }

      // Create role
      const role = await manager.save(Role, payload);

      // Insert permissions
      if (permissionExists.length > 0) {
        const rolePermissions = permissionExists.map((permission: Permission) =>
          manager.getRepository(RolePermission).create({
            roleId: role.id,
            permissionId: permission.id,
          }),
        );

        // Save role-permission relations
        await manager.getRepository(RolePermission).save(rolePermissions);
      }

      role.permissions = permissionExists || [];
      const dto = plainToInstance(RoleDto, role, {
        excludeExtraneousValues: true,
      });

      return CreatedResponse<RoleDto>(dto);
    });
  }
}
