import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@src/modules/iam/entities/role.entity';
import { User } from '@src/modules/iam/entities/user.entity';
import { Repository } from 'typeorm';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { JwtService } from '@nestjs/jwt';
import { CommandHandler } from '@nestjs/cqrs';
import * as bcrypt from 'bcrypt';
import { BadRequestHttpException } from '@src/shared/core/exceptions/exception';
import { plainToInstance } from 'class-transformer';
import { UserDto } from '@src/modules/iam/users/dto/user.dto';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { LoginCommand } from '../imp/login.command';

@CommandHandler(LoginCommand)
export class AuthLoginHandler extends BaseHandler<
  LoginCommand,
  ApiResponseDto<any>
> {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  protected async handle(command: LoginCommand): Promise<ApiResponseDto<any>> {
    const { username, password, fcmToken } = command.payload;

    // 1. Autentikasi kredensial pengguna
    const user = await this._authenticateUser(username, password);

    // 2. Perbarui sesi pengguna (refresh & fcm token)
    await this._updateUserSession(user, fcmToken);

    // 3. Dapatkan konteks otorisasi (role & permissions)
    const authContext = await this._getAuthorizationContext(user);

    // 4. Buat access token
    const token = await this._generateAccessToken(
      user,
      authContext.roleName,
      authContext.permissions,
    );

    // 5. Format respons akhir
    return this._formatResponse(user, token);
  }

  // PRIVATE HELPER METHODS

  // Langkah 1: Memvalidasi kredensial dan mengembalikan entitas User.
  private async _authenticateUser(
    username: string,
    password: string,
  ): Promise<User> {
    const user = await this.userRepository.findOne({
      where: [{ username }, { email: username }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestHttpException('Credential is incorrect');
    }
    return user;
  }

  private async _updateUserSession(
    user: User,
    fcmToken?: string,
  ): Promise<void> {
    user.refreshToken = this._makeRandomChar(32);
    if (fcmToken) {
      user.fcmToken = fcmToken;
    }
    await this.userRepository.save(user);
  }

  private async _getAuthorizationContext(
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

  private async _generateAccessToken(
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

  private _formatResponse(user: User, token: string): ApiResponseDto<any> {
    const decodedToken = this.jwtService.decode(token) as { exp: number };
    const expiredAt = decodedToken.exp * 1000;

    const userDto = plainToInstance(UserDto, user, {
      excludeExtraneousValues: true,
    });

    return OkResponse<any>(
      {
        user: userDto,
        refreshToken: user.refreshToken,
        token,
        expiredAt,
      },
      'Login successful',
    );
  }

  private _makeRandomChar(length: number) {
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
