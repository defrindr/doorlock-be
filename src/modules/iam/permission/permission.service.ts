import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundHttpException } from '@src/shared/core/exceptions/exception';
import {
  CreatedResponse,
  DeletedResponse,
  OkResponse,
} from '@src/shared/core/handlers/response.handler';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { ResponsePermissionDto } from './dto/response-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(dataCreate: CreatePermissionDto) {
    try {
      const entity = await this.permissionRepository.save(dataCreate);

      const dto = plainToInstance(ResponsePermissionDto, entity, {
        excludeExtraneousValues: true,
      });

      return CreatedResponse<ResponsePermissionDto>(dto);
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateUpdate: UpdatePermissionDto) {
    const dataFirst = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!dataFirst) {
      throw new NotFoundHttpException('Permission not found');
    }

    const mergeObj = Object.assign(dataFirst, updateUpdate);

    try {
      const entity = await this.permissionRepository.save(mergeObj);

      const dto = plainToInstance(ResponsePermissionDto, entity, {
        excludeExtraneousValues: true,
      });

      return OkResponse<ResponsePermissionDto>(dto, 'Permission updated');
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    const data = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!data) {
      throw new NotFoundHttpException('Permission not found');
    }

    try {
      await this.permissionRepository.remove(data);

      return DeletedResponse('Permission deleted');
    } catch (error) {
      throw error;
    }
  }
}
