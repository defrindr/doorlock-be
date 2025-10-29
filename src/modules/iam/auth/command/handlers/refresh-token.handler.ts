import { CommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { User } from '@src/modules/iam/entities/user.entity';
import { UserDto } from '@src/modules/iam/users/dto/user.dto';
import { BaseHandler } from '@src/shared/core/handlers/base.handler';
import { OkResponse } from '@src/shared/core/handlers/response.handler';
import { ApiResponseDto } from '@src/shared/core/responses/api-response.dto';
import { plainToInstance } from 'class-transformer';
import { LoginResponseDto } from '../../dto/login-response.dto';
import { RefreshTokenCommand } from '../imp/refresh-token.command';
import { AuthService } from './../../auth.service';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler extends BaseHandler<
  RefreshTokenCommand,
  ApiResponseDto<LoginResponseDto>
> {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {
    super();
  }

  protected async handle(
    command: RefreshTokenCommand,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    const { refreshToken, fcmToken } = command.payload;

    const user =
      await this.authService.authenticateUserByRefreshToken(refreshToken);

    await this.authService.updateUserSession(user, fcmToken);

    const authContext = await this.authService.getAuthorizationContext(user);

    const token = await this.authService.generateAccessToken(
      user,
      authContext.roleName,
      authContext.permissions,
    );

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
      'Refresh token successful',
    );
  }
}
