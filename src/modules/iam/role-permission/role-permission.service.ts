import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRolePermissionDto } from './dto/create-role-permission.dto';
import { RolePermission } from './entities/role-permission.entity';
import { ErrorHandler } from '@src/shared/handlers/error.handler';

@Injectable()
export class RolePermissionService {
  constructor(
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async create(dataCreate: CreateRolePermissionDto) {
    // check if exist
    const existData = await this.rolePermissionRepository.findOne({
      where: {
        roleId: dataCreate.roleId,
        permissionId: dataCreate.permissionId,
      },
    });

    if (existData) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Terdeteksi duplikasi data',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const data = await this.rolePermissionRepository.save(dataCreate);

      return {
        code: HttpStatus.CREATED,
        message: 'Data berhasil disimpan',
        data,
      };
    } catch (error) {
      ErrorHandler(error);
    }
  }

  async remove(id: number) {
    const data = await this.rolePermissionRepository.findOne({
      where: { id },
    });

    if (!data) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Role Permission not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    await this.rolePermissionRepository.remove(data);
    return {
      code: HttpStatus.OK,
      message: 'Role Permission deleted',
    };
  }
}
