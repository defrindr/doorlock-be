import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PermissionAccess } from '@src/shared/core/decorators/permission-access.decorator';
import { User } from '@src/shared/core/decorators/user.decorator';
import { IUser } from '@src/shared/storage/user.storage';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginCommand } from './command/imp/login.command';
import { ApiSingleResponse } from '@src/shared/core/decorators/api-single-response.decorator';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenCommand } from './command/imp/refresh-token.command';
import { GetProfileQuery } from './query/imp/get-profile.query';
import { UserDto } from '../users/dto/user.dto';
import { ApiCommonErrors } from '@src/shared/core/decorators/api-common-error.decorator';

@ApiTags('Auth')
@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly svc: AuthService,
  ) {}

  @ApiOperation({
    summary: 'User Login',
    description:
      'Authenticate user credentials and return JWT access token and refresh token for API access',
  })
  @Post('login')
  @ApiSingleResponse(LoginResponseDto, 'Login successful')
  @ApiCommonErrors()
  async login(@Body() payload: LoginDto): Promise<any> {
    return this.commandBus.execute(new LoginCommand(payload));
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Get User Profile',
    description:
      'Retrieve detailed information of the currently authenticated user including roles and permissions',
  })
  @ApiSingleResponse(UserDto, 'Successfully retrieved user profile')
  @PermissionAccess()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiCommonErrors()
  async me(@User() user: IUser): Promise<any> {
    return this.queryBus.execute(new GetProfileQuery(user));
  }

  @ApiOperation({
    summary: 'Refresh Authentication Token',
    description:
      'Generate new access token using valid refresh token to maintain authenticated session',
  })
  @Post('refresh-token')
  @ApiSingleResponse(LoginResponseDto, 'Token refreshed successfully')
  @ApiCommonErrors()
  async refreshToken(@Body() payload: RefreshTokenDto): Promise<any> {
    return this.commandBus.execute(new RefreshTokenCommand(payload));
  }
}
