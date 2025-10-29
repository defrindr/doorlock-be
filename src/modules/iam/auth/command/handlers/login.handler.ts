import { CommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { User } from '@src/modules/iam/entities/user.entity';
import { UserDto } from '@src/modules/iam/users/dto/user.dto';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';
import { AuthService } from '../../auth.service';
import { LoginResponseDto } from '../../dto/login-response.dto';
import { LoginCommand } from '../imp/login.command';

@CommandHandler(LoginCommand)
export class LoginHandler extends BaseHandler<
  LoginCommand,
  ApiResponseDto<LoginResponseDto>
> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  protected async handle(
    command: LoginCommand,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    const { username, password, fcmToken } = command.payload;

    // 1. Autentikasi kredensial pengguna
    const user = await this.authService.authenticateUser(username, password);

    // 2. Perbarui sesi pengguna (refresh & fcm token)
    await this.authService.updateUserSession(user, fcmToken);

    // 3. Dapatkan konteks otorisasi (role & permissions)
    const authContext = await this.authService.getAuthorizationContext(user);

    // 4. Buat access token
    const token = await this.authService.generateAccessToken(
      user,
      authContext.roleName,
      authContext.permissions,
    );

    // 5. Format respons akhir
    return this._formatResponse(user, token, authContext.permissions);
  }

  private _formatResponse(
    user: User,
    token: string,
    permissions: string[] = [],
  ): ApiResponseDto<LoginResponseDto> {
    const decodedToken = this.jwtService.decode(token) as { exp: number };
    const expiredAt = decodedToken.exp * 1000;

    const userDto = plainToInstance(
      UserDto,
      { ...user, permissions },
      {
        excludeExtraneousValues: true,
      },
    );

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
}
