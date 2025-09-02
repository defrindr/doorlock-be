import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestResponse,
  SuccessResponse,
} from '@src/lib/handlers/response.handler';
import * as argon2 from 'argon2';
import { log } from 'console';
import { Repository } from 'typeorm';
import { ErrorHandler } from '../../lib/handlers/error.handler';
import { IUser } from '../../lib/storage/user.storage';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token';
import { RegisterDto } from './dto/register.dto';
import { Role } from './role/entities/role.entity';
import { UpdateUserDto } from './users/dto/update-user.dto';
import { User } from './users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}

  async me(user: IUser) {
    try {
      const userExist = await this.userRepository.findOne({
        where: { id: user.id },
        relations: ['role']
      });
      if (!userExist) {
        return BadRequestResponse('User doesnt exist in our system');
      }

      return SuccessResponse('Success get profile', { profile: userExist });
    } catch (error) {
      return ErrorHandler(error);
    }
  }

  async update(user: IUser, updateUserDto: UpdateUserDto) {
    // check is profile exist
    let userExist = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!userExist) {
      return BadRequestResponse('User doesnt exist in our system');
    }

    // merger request with existing data
    userExist = Object.assign(userExist, updateUserDto);

    // hash password if exist
    if (updateUserDto.password) {
      userExist.password = await argon2.hash(userExist.password);
    }

    // trying save data to database
    try {
      const data = await this.userRepository.save(userExist);
      return SuccessResponse('Profile successfully updated', { profile: data });
    } catch (error) {
      return ErrorHandler(error);
    }
  }

  async register(payload: RegisterDto) {
    const usernameExist = await this.userRepository.findOne({
      where: { username: payload.username },
    });
    if (usernameExist) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Username already used',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // payload.roleId = 7; // User Public
      payload.password = await argon2.hash(payload.password);

      // update user
      payload.refreshToken = this.makeid(32);

      const user = await this.userRepository.save(payload);

      // get role & permission
      const role: Role | null = await this.roleRepository.findOne({
        where: { id: user.roleId },
        relations: ['rolePermissions.permission'],
      });

      if (!role || role?.rolePermissions === undefined) {
        throw new HttpException(
          {
            code: HttpStatus.BAD_REQUEST,
            message: 'Role doesnt exist',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const permissions = role.rolePermissions.map(
        (item) => item.permission.name,
      );
      // generate token
      const token = await this.jwtService.signAsync({
        ...user,
        role: role.name,
        permissions,
      });

      const date = new Date();
      date.setDate(date.getDate() + 1);

      return {
        code: 200,
        message: 'Login Success',
        data: {
          refreshToken: user.refreshToken,
          token,
          expiredAt: date.getTime(),
        },
      };
    } catch (error) {
      ErrorHandler(error);
    }
  }

  async login({ username, password, fcmToken = '' }: LoginDto) {
    // check user
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new BadRequestException('Credential invalid');
    }

    // check password
    const isPasswordValid = await argon2.verify(user.password, password);

    if (!isPasswordValid) {
      throw new BadRequestException('Credential invalid');
    }

    // update user
    user.refreshToken = this.makeid(32);
    // update fcm token if exist
    if (fcmToken != '') user.fcmToken = fcmToken;

    await this.userRepository.save(user);

    // get role & permission
    const role = await this.roleRepository.findOne({
      where: { id: user.roleId },
      relations: ['rolePermissions.permission'],
    });

    if (!role || role?.rolePermissions === undefined) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Role doesnt exist',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const permissions = role.rolePermissions.map(
      (item) => item.permission.name,
    );
    // generate token
    log(this.jwtService);
    const token = await this.jwtService.signAsync({
      ...user,
      role: role.name,
      permissions,
    });

    const date = new Date();
    date.setDate(date.getDate() + 1);

    return {
      code: 200,
      message: 'Login Success',
      data: {
        refreshToken: user.refreshToken,
        token,
        expiredAt: date.getTime(),
      },
    };
  }

  async refreshToken(data: RefreshTokenDto) {
    const { refreshToken, fcmToken } = data;
    const user = await this.userRepository.findOne({
      where: { refreshToken },
    });

    if (!user) {
      throw new BadRequestException('Token invalid');
    }

    // update user
    user.refreshToken = this.makeid(32);
    if (fcmToken != '') {
      user.fcmToken = fcmToken;
    }
    await this.userRepository.save(user);

    // get role & permission
    const role = await this.roleRepository.findOne({
      where: { id: user.roleId },
      relations: ['rolePermissions.permission'],
    });

    if (!role || role?.rolePermissions === undefined) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Role doesnt exist',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const permissions = role.rolePermissions.map(
      (item) => item.permission.name,
    );
    // generate token
    const token = await this.jwtService.signAsync({
      ...user,
      role: role.name,
      permissions,
    });

    return {
      code: 200,
      message: 'Login Success',
      data: {
        refreshToken: user.refreshToken,
        token,
      },
    };
  }

  makeid(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
}
