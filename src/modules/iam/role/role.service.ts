import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '../entities/role.entity';
import {
  PageDto,
  PageOptionsDto,
  PaginationFactory,
} from '@src/shared/utils/paginations';
import { ErrorHandler } from '@src/shared/core/handlers/error.handler';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<Role>> {
    const queryBuilder = await this.roleRepository.createQueryBuilder();

    // sorting
    const allowedSortFields = ['name'];
    // dynamic search
    const allowedSearchFields = ['name'];
    const paginationFactory = new PaginationFactory(queryBuilder, {
      pageOptionsDto,
      allowedSortFields,
      allowedSearchFields,
    });

    return await paginationFactory.createPage();
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
    try {
      const data = await this.roleRepository.save(dataCreate);
      return {
        code: HttpStatus.CREATED,
        message: 'Data berhasil disimpan',
        data,
      };
    } catch (error) {
      ErrorHandler(error);
    }
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
      ErrorHandler(error);
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
      ErrorHandler(error);
    }
  }
}
