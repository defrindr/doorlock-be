import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';
import { generateRandomString } from '@src/shared/utils/helpers';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
  ) {}

  async generateAccessToken(
    user: User,
    roleName: string,
    permissions: string[],
  ): Promise<string> {
    const payload = {
      sub: user.id,
      username: user.username,
      role: roleName,
      permissions,
    };
    return this.jwtService.signAsync(payload);
  }

  async updateUserSession(user: User, fcmToken?: string): Promise<void> {
    const refreshToken = generateRandomString(32);

    user.refreshToken = refreshToken;
    const updatePayload: QueryDeepPartialEntity<User> = {
      refreshToken: refreshToken,
    };

    if (fcmToken) {
      updatePayload.fcmToken = fcmToken;
    }

    // Langsung jalankan query UPDATE tanpa SELECT terlebih dahulu.
    await this.userRepository.update(
      {
        id: user.id,
      },
      updatePayload,
    );
  }

  async authenticateUser(username: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: [{ username }, { email: username }],
    });

    if (!user || !(await bcrypt.compare(user.password, password))) {
      throw new BadRequestHttpException('Credential is incorrect');
    }
    return user;
  }

  async authenticateUserByRefreshToken(refreshToken: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { refreshToken },
    });

    if (!user) {
      throw new BadRequestHttpException('Refresh token is invalid');
    }

    return user;
  }

  async getAuthorizationContext(
    user: User,
  ): Promise<{ roleName: string; permissions: string[] }> {
    const role = await this.roleRepository.findOne({
      where: { id: user.roleId },
      relations: ['rolePermissions.permission'],
    });

    if (!role?.rolePermissions) {
      throw new BadRequestHttpException(
        'User role is not configured correctly.',
      );
    }

    const permissions = role.rolePermissions.map(
      (item) => item.permission.name,
    );
    return { roleName: role.name, permissions };
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });

    if (!user) {
      throw new BadRequestHttpException('User doesnt exist in our system');
    }

    return user;
  }
}
