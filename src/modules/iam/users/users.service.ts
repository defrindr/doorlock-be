import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PageDto,
  PageOptionsDto,
  PaginationFactory,
} from '@src/shared/utils/paginations';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { ErrorHandler } from '@src/shared/core/handlers/error.handler';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<User>> {
    const queryBuilder = await this.userRepository.createQueryBuilder();

    // sorting
    const allowedSortFields = ['id', 'username', 'email', 'nik', 'name'];

    // dynamic search
    const allowedSearchFields = ['username', 'email', 'nik', 'name'];

    const paginationFactory = new PaginationFactory(queryBuilder, {
      pageOptionsDto,
      allowedSortFields,
      allowedSearchFields,
    });

    return await paginationFactory.createPage();
  }

  async findSpecific(options: PageOptionsDto, type: number) {
    const queryBuilder = await this.userRepository.createQueryBuilder();
    // find specific by type
    if (!type || type === 1) {
      // except for admin
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Invalid type',
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      queryBuilder.andWhere(`"roleId" = ${type}`);
    }

    const allowedSortFields = ['id', 'username', 'email', 'nik', 'name'];
    const allowedSearchFields = ['username', 'email', 'nik', 'name'];
    const paginationFactory = new PaginationFactory(queryBuilder, {
      pageOptionsDto: options,
      allowedSortFields,
      allowedSearchFields,
    });
    return await paginationFactory.createPage();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'Pengguna tidak ditemukan',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      code: HttpStatus.OK,
      message: 'Data berhasil didapatkan',
      data: user,
    };
  }

  async create(createUserDto: CreateUserDto) {
    try {
      createUserDto.password = await argon2.hash(createUserDto.password);

      const data = await this.userRepository.save(createUserDto);
      return {
        code: HttpStatus.CREATED,
        message: 'Data berhasil disimpan',
        data,
      };
    } catch (error) {
      ErrorHandler(error);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    let user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    user = Object.assign(user, updateUserDto);

    // hash password
    if (updateUserDto.password) {
      user.password = await argon2.hash(user.password);
    }

    try {
      const data = await this.userRepository.save(user);
      return {
        code: HttpStatus.OK,
        message: 'Data berhasil diubah',
        data,
      };
    } catch (error) {
      ErrorHandler(error);
    }
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new HttpException(
        {
          code: HttpStatus.NOT_FOUND,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    try {
      await this.userRepository.remove(user);
      return {
        code: HttpStatus.OK,
        message: 'User deleted',
      };
    } catch (error) {
      ErrorHandler(error);
    }
  }
}
