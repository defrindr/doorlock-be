import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorHandler } from '../../../lib/handlers/error.handler';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { PageDto, PageMetaDto, PageOptionsDto } from '@src/lib/paginations';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<Permission>> {
    const queryBuilder = await this.permissionRepository.createQueryBuilder();

    // limit and offset
    queryBuilder.skip(pageOptionsDto.skip).take(pageOptionsDto.take);

    // sorting
    const allowedSortFields = ['id', 'name'];
    if (pageOptionsDto.sort) {
      for (const [key, value] of Object.entries(pageOptionsDto.sort)) {
        if (allowedSortFields.includes(key)) {
          queryBuilder.addOrderBy(key, value);
        }
      }
    }

    // dynamic search
    const allowedSearchFields = ['name'];
    if (pageOptionsDto.search) {
      for (const [key, value] of Object.entries(pageOptionsDto.search)) {
        if (allowedSearchFields.includes(key)) {
          queryBuilder.andWhere(`${key} LIKE :${key}`, { [key]: `%${value}%` });
        }
      }
    }

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(entities, pageMetaDto);
  }

  async findOne(id: string) {
    const firstData = await this.permissionRepository.findOne({
      where: { id },
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

  async create(dataCreate: CreatePermissionDto) {
    try {
      const data = await this.permissionRepository.save(dataCreate);
      return {
        code: HttpStatus.CREATED,
        message: 'Data berhasil disimpan',
        data,
      };
    } catch (error) {
      ErrorHandler(error);
    }
  }

  async update(id: string, updateUpdate: UpdatePermissionDto) {
    const dataFirst = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!dataFirst) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Permission not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const mergeObj = Object.assign(dataFirst, updateUpdate);

    try {
      const data = await this.permissionRepository.save(mergeObj);
      return {
        code: HttpStatus.OK,
        message: 'Permission updated',
        data,
      };
    } catch (error) {
      ErrorHandler(error);
    }
  }

  async remove(id: string) {
    const data = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!data) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Permission not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      await this.permissionRepository.remove(data);
      return {
        code: HttpStatus.OK,
        message: 'Permission deleted',
      };
    } catch (error) {
      ErrorHandler(error);
    }
  }
}
