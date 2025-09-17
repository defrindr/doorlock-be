import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestHttpException,
  NotFoundHttpException,
} from '@src/shared/core/exceptions/exception';
import { ErrorHandler } from '@src/shared/core/handlers/error.handler';
import {
  CreatedResponse,
  DeletedResponse,
  OkResponse,
} from '@src/shared/core/handlers/response.handler';
import { applyPaginationFilters } from '@src/shared/utils/paginations/apply-pagination-filter';
import {
  PageMetaDto,
  PageOptionsDto,
} from '@src/shared/utils/paginations/dto/index';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PagePermissionDto } from './dto/page-permission.dto';
import { ResponsePermissionDto } from './dto/response-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PagePermissionDto> {
    let queryBuilder = await this.permissionRepository.createQueryBuilder();

    queryBuilder = applyPaginationFilters(queryBuilder, {
      alias: 'permission',
      allowedSort: ['id', 'name'],
      allowedSearch: ['name', 'description'],
      allowedFilter: ['id', 'name'],
      pageOptions: pageOptionsDto,
    });

    const [entities, itemCount] = await queryBuilder.getManyAndCount();

    const data = plainToInstance(ResponsePermissionDto, entities, {
      excludeExtraneousValues: true, // optional: strips fields not in DTO
    });

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PagePermissionDto(data, pageMetaDto);
  }

  async findOne(id: string) {
    try {
      const entity = await this.permissionRepository.findOne({
        where: { id },
      });

      if (!entity) {
        throw new NotFoundHttpException();
      }

      const dto = plainToInstance(ResponsePermissionDto, entity, {
        excludeExtraneousValues: true,
      });

      return OkResponse<ResponsePermissionDto>(dto);
    } catch (error) {
      throw new BadRequestHttpException(error.message);
    }
  }

  async create(dataCreate: CreatePermissionDto) {
    try {
      const entity = await this.permissionRepository.save(dataCreate);

      const dto = plainToInstance(ResponsePermissionDto, entity, {
        excludeExtraneousValues: true,
      });

      return CreatedResponse<ResponsePermissionDto>(dto);
    } catch (error) {
      return ErrorHandler(error);
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
      return ErrorHandler(error);
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
      return ErrorHandler(error);
    }
  }
}
