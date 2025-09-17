import { CommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { RolePermission } from '@src/modules/iam/entities/role-permission.entity';
import { Role } from '@src/modules/iam/entities/role.entity';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import {
  BadRequestHttpException,
  NotFoundHttpException,
} from '@src/shared/core/exceptions/exception';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { RoleDto } from '../../dto/role.dto';
import { UpdateRoleCommand } from '../imp/update-role.command';
import { Permission } from '@src/modules/iam/entities/permission.entity';

@CommandHandler(UpdateRoleCommand)
export class UpdateRoleHandler extends BaseHandler<
  UpdateRoleCommand,
  ApiResponseDto<RoleDto>
> {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Role)
    protected readonly roleRepository: Repository<Role>,
  ) {
    super();
  }

  async handle(command: UpdateRoleCommand): Promise<ApiResponseDto<RoleDto>> {
    const { id, payload } = command;
    const { permissionIds, ...roleData } = payload;

    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // Check if role exists
      let role: Role | null;
      let currentPermissions: string[];
      let newPermissions: string[];
      try {
        [role, currentPermissions, newPermissions] = await Promise.all([
          // Find Role
          manager.findOne(Role, { where: { id } }),
          // Find Current Permissions
          manager
            .find(RolePermission, {
              where: { roleId: id },
              select: { permissionId: true },
            })
            .then((res) => {
              return res.map((r) => r.permissionId);
            }),
          // Find New Permissions
          permissionIds
            ? manager
                .find(Permission, {
                  where: { id: In(permissionIds) },
                })
                .then((res) => {
                  return res.map((r) => r.id);
                })
            : [],
        ]);
      } catch (error) {
        throw new BadRequestHttpException(error.message);
      }

      if (!role) {
        throw new NotFoundHttpException('Role not found');
      }

      const removedPermissions = currentPermissions.filter(
        (p) => !newPermissions.includes(p),
      );
      const addedPermissions = newPermissions.filter(
        (p) => !currentPermissions.includes(p),
      );

      await Promise.all([
        // update role
        manager.update(
          Role,
          {
            id,
          },
          {
            ...role,
            ...roleData,
          },
        ),
        // Delete permissions
        removedPermissions
          ? manager.delete(RolePermission, {
              roleId: id,
              permissionId: In(removedPermissions),
            })
          : Promise.resolve(),
        // Add permissions
        addedPermissions
          ? manager.save(
              RolePermission,
              addedPermissions.map((permissionId) => ({
                roleId: id,
                permissionId,
              })),
            )
          : Promise.resolve(),
      ]);

      // Fetch the updated role with its permissions for the response
      const roleWithPermissions = await manager.findOne(Role, {
        where: { id },
        relations: ['rolePermissions', 'rolePermissions.permission'],
      });

      // Transform permissions for DTO
      if (roleWithPermissions?.rolePermissions) {
        roleWithPermissions.permissions =
          roleWithPermissions.rolePermissions.map((rp) => rp.permission);
      }

      const dto = plainToInstance(RoleDto, roleWithPermissions, {
        excludeExtraneousValues: true,
      });

      return OkResponse<RoleDto>(dto, 'Role updated');
    });
  }
}
