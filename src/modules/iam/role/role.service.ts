import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageMetaDto, PageOptionsDto } from '@src/shared/paginations';
import { applyPaginationFilters } from '@src/shared/paginations/apply-pagination-filter';
import { plainToInstance } from 'class-transformer';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { RolePermission } from '../entities/role-permission.entity';
import { Role } from '../entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { PageRoleDto } from './dto/page-role.dto';
import { RoleDto } from './dto/role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageRoleDto> {
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

    console.log(transformEntities);

    // Transform to DTO
    const dto = plainToInstance(RoleDto, transformEntities, {
      excludeExtraneousValues: true,
    });

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageRoleDto(dto, pageMetaDto);
  }

  async findOne(id: string) {
    const firstData = await this.roleRepository.findOne({
      where: { id },
      // get permissions from rolePermissions without rolePermissions
      relations: {
        rolePermissions: {
          permission: true,
        },
      },
    });

    if (!firstData) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Data tidak ditemukan',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      code: HttpStatus.OK,
      message: 'Data ditemukan',
      data: firstData,
    };
  }

  async create(dataCreate: CreateRoleDto) {
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      try {
        // Extract permission
        const permissions = dataCreate.permissionIds;

        // Create role
        const role = await manager.save(Role, dataCreate);

        // Insert permissions
        if (permissions) {
          const rolePermissions = permissions.map((permId: string) =>
            manager.getRepository(RolePermission).create({
              roleId: role.id,
              permissionId: permId,
            }),
          );

          // Save role-permission relations
          await manager.getRepository(RolePermission).save(rolePermissions);
        }

        return {
          code: HttpStatus.CREATED,
          message: 'Data berhasil disimpan',
          data: role,
        };
      } catch (error) {
        throw error;
      }
    });
  }

  async update(id: string, updateUpdate: UpdateRoleDto) {
    const dataFirst = await this.roleRepository.findOne({
      where: { id },
    });

    if (!dataFirst) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Role not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const mergeObj = Object.assign(dataFirst, updateUpdate);

    try {
      const data = await this.roleRepository.save(mergeObj);
      return {
        code: HttpStatus.OK,
        message: 'Role updated',
        data,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    const data = await this.roleRepository.findOne({
      where: { id },
    });
    if (!data) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Role not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    try {
      await this.roleRepository.remove(data);
      return {
        code: HttpStatus.OK,
        message: 'Role deleted',
      };
    } catch (error) {
      throw error;
    }
  }
}
